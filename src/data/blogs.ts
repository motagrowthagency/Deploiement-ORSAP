export type BlogPost = {
  id: string
  title: string
  summary: string
  content: string
  date: string
  image?: string | null
  pdf?: string | null
  pdfName?: string | null
}

export const INITIAL_BLOGS: BlogPost[] = []
