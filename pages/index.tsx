import {
  Avatar,
  Box,
  Container,
  Divider,
  Heading,
  HStack,
  Link,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import Layout from "components/Layout";
import client from "db/prismadb";
import { GetStaticProps } from "next";
import { useSession } from "next-auth/react";
import Router from "next/router";
import { BlogAuthorProps, PostProps } from "./types";

export const getStaticProps: GetStaticProps = async () => {
  const feed = await client.post.findMany({
    where: {
      published: true,
    },
    include: {
      author: {
        select: { name: true },
      },
    },
  });
  return {
    props: { feed },
  };
};

const BlogAuthor: React.FC<BlogAuthorProps> = (props) => {
  const { data: session, status } = useSession();
  const loading = status === "loading";
  if (loading) {
    return (
      <Stack direction="row" spacing={4}>
        <Spinner size="lg" />
      </Stack>
    );
  }

  return (
    <HStack marginTop="2" spacing="2" display="flex" alignItems="center">
      <Avatar
        src={session?.user?.image ?? undefined}
        size="sm"
        name={session?.user?.name ?? ""}
        ml={-1}
        mr={2}
      />
      <Text fontWeight="medium">{props.name}</Text>
      <Text>—</Text>
      <Text>{props.date.toLocaleDateString()}</Text>
    </HStack>
  );
};

type FeedProps = {
  feed: PostProps[];
};

const Blog: React.FC<FeedProps> = (props) => {
  const bgColor = useColorModeValue("blue.50", "blue.900");
  const color = useColorModeValue("gray.700", "gray.200");
  return (
    <Layout>
      <Container maxW="container.xl" py={12}>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
          <Stack spacing={4}>
            <Text
              textTransform={"uppercase"}
              color={"blue.400"}
              fontWeight={600}
              fontSize={"sm"}
              bg={bgColor}
              p={2}
              alignSelf={"flex-start"}
              rounded={"md"}
            >
              {props.feed.length !== 0 ? "Public Feed" : "No Feed"}
            </Text>
          </Stack>
        </SimpleGrid>
      </Container>

      {props.feed.map((post) => {
        return (
          <Container
            key={post.id}
            maxW="container.xl"
            onClick={() => Router.push("/p/[id]", `/p/${post.id}`)}
          >
            <Box
              marginTop={{ base: "1", sm: "5" }}
              display="flex"
              flexDirection={{ base: "column", sm: "row" }}
              justifyContent="space-between"
            >
              <Box
                display="flex"
                flex="1"
                flexDirection="column"
                justifyContent="center"
                marginTop={{ base: "3", sm: "0" }}
              >
                <Heading marginTop="1">
                  <Link
                    textDecoration="none"
                    _hover={{ textDecoration: "none" }}
                  >
                    {post.title}
                  </Link>
                </Heading>
                <Link textDecoration="none" _hover={{ textDecoration: "none" }}>
                  <Text as="p" marginTop="2" color={color} fontSize="lg">
                    {post.content}
                  </Text>
                </Link>
                <BlogAuthor name={post.author.name} date={post.createdAt} />
              </Box>
            </Box>
            <Divider marginTop="5" />
          </Container>
        );
      })}
    </Layout>
  );
};

export default Blog;
