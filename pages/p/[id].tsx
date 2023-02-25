import { useSession } from "next-auth/react";
import { BlogAuthorProps, PostProps } from "pages/types";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Avatar,
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Link,
  Stack,
  Text,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import Layout from "components/Layout";
import { createRef, useState } from "react";
import { GetServerSideProps } from "next";
import client from "db/prismadb";
import Router from "next/router";
import { CheckCircleIcon, DeleteIcon } from "@chakra-ui/icons";

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const post = await client.post.findUnique({
    where: {
      id: Number(params?.id) || -1,
    },
    include: {
      author: {
        select: { name: true, email: true },
      },
    },
  });
  return {
    props: post ?? {},
  };
};

async function publishPost(id: number): Promise<void> {
  await fetch(`http://localhost:3000/api/publish/${id}`, {
    method: "PUT",
  });
  await Router.push("/");
}

async function deletePost(id: number): Promise<void> {
  console.log(id);
  await fetch(`http://localhost:3000/api/post/${id}`, {
    method: "DELETE",
  });
  await Router.push("/");
}

const BlogAuthor: React.FC<BlogAuthorProps> = (props) => {
  const { data: session, status } = useSession();
  const loading = status === "loading";
  const color = useColorModeValue("gray.50", "gray.800");

  if (loading) {
    return <div>Loading ...</div>;
  }

  if (!session) {
    return (
      <Layout>
        <Flex minH={"100vh"} align={"center"} justify={"center"} bg={color}>
          <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
            <Stack align={"center"}>
              <Heading fontSize={"4xl"}>Sign in to your account</Heading>
              <Text fontSize={"lg"} color={"gray.600"}>
                to see drafts <Link color={"blue.400"}></Link> ✌️
              </Text>
            </Stack>
          </Stack>
        </Flex>
      </Layout>
    );
  }

  return (
    <HStack marginTop="2" spacing="2" display="flex" alignItems="center">
      <Avatar
        src={session.user?.image ?? undefined}
        size="sm"
        name="Daniel Laera"
        ml={-1}
        mr={2}
      />
      <Text fontWeight="medium">{props.name}</Text>
      <Text>—</Text>
      <Text>{props.date.toLocaleDateString()}</Text>
    </HStack>
  );
};

const Post: React.FC<PostProps> = (props) => {
  const toast = useToast();

  const [isDelete, setIsDelete] = useState(false);
  const onCloseDelete = () => setIsDelete(false);
  const [isPublish, setIsPublish] = useState(false);
  const onClosePublish = () => setIsPublish(false);
  const cancelRef = createRef<HTMLButtonElement>();

  const color = useColorModeValue("gray.700", "gray.200");

  const { data: session, status } = useSession();
  if (status === "loading") {
    return <div>Authenticating...</div>;
  }

  const userHasValidSession = Boolean(session);
  const postBelongsToUser = session?.user?.email === props.author?.email;
  let title = props.title;
  if (!props.published) {
    title = `${title} (Draft)`;
  }

  return (
    <Layout>
      <div>
        <AlertDialog
          isOpen={isDelete}
          leastDestructiveRef={cancelRef}
          onClose={onCloseDelete}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Delete Post
              </AlertDialogHeader>
              <AlertDialogBody>
                Are you sure? You will not be able to undo this afterwards.
              </AlertDialogBody>
              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={onCloseDelete}>
                  Cancel
                </Button>
                <Button
                  colorScheme="red"
                  onClick={() => {
                    deletePost(props.id);
                    toast({
                      title: "Post deleted.",
                      description: "Your post has been deleted.",
                      status: "success",
                      duration: 5000,
                      isClosable: true,
                    });
                  }}
                  ml={3}
                >
                  Delete Post
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
        <AlertDialog
          isOpen={isPublish}
          leastDestructiveRef={cancelRef}
          onClose={onCloseDelete}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Publish Post
              </AlertDialogHeader>
              <AlertDialogBody>Are you sure?</AlertDialogBody>
              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={onClosePublish}>
                  Cancel
                </Button>
                <Button
                  colorScheme="red"
                  onClick={() => {
                    publishPost(props.id);
                    toast({
                      title: "Post published.",
                      description: "Your post has been pulished.",
                      status: "success",
                      duration: 5000,
                      isClosable: true,
                    });
                  }}
                  ml={3}
                >
                  Publish Post
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
        {/* end of alerts */}
        <Container maxW="container.xl">
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
                <Link textDecoration="none" _hover={{ textDecoration: "none" }}>
                  {title}
                </Link>
              </Heading>
              <Text as="p" marginTop="2" color={color} fontSize="lg">
                {props.content}
              </Text>
              <BlogAuthor name={props.author.name} date={props.createdAt} />

              <Stack spacing={10}>
                <Stack
                  direction={{ base: "column", sm: "row" }}
                  align={"start"}
                  justify={"space-between"}
                ></Stack>
                <Stack direction="row" spacing={4}>
                  {!props.published &&
                    userHasValidSession &&
                    postBelongsToUser && (
                      <Button
                        type="submit"
                        leftIcon={<CheckCircleIcon />}
                        colorScheme="linkedin"
                        variant="solid"
                        onClick={() => setIsPublish(true)}
                      >
                        Publish
                      </Button>
                    )}
                  {userHasValidSession && postBelongsToUser && (
                    <Button
                      leftIcon={<DeleteIcon />}
                      colorScheme="red"
                      variant="solid"
                      onClick={() => setIsDelete(true)}
                    >
                      Delete
                    </Button>
                  )}
                </Stack>
              </Stack>
            </Box>
          </Box>
        </Container>
      </div>
    </Layout>
  );
};

export default Post;
