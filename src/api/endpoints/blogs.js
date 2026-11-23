import api from "../client";

export async function listarBlogs() {
  const { data } = await api.get("/blogs");
  return data;
}

export async function obtenerBlog(slug) {
  const { data } = await api.get(`/blogs/${slug}`);
  return data;
}
