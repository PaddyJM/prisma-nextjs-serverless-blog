export interface BlogAuthorProps {
  date: Date;
  name: string;
}

export type PostProps = {
  id: number;
  title: string;
  author: {
    name: string;
    email: string;
  };
  content: string;
  published: boolean;
  createdAt: Date;
};
