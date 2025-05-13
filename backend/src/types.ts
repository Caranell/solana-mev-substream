import { Prisma } from "@prisma/client"

export interface IFeedQueryString {
  searchString: string | null
  skip: number | null
  take: number | null
  orderBy: Prisma.SortOrder | null
}

export interface IPostByIdParam {
  id: number
}

export interface ICreatePostBody {
  title: string
  content: string | null
  authorEmail: string
}

export interface ISignupBody {
  name: string | null
  email: string
  posts: Prisma.PostCreateInput[]
}