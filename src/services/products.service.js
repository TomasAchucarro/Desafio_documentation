import { Product } from "../dao/factory/products.factory.js";
import ProductRepository from "../repositories/products.repository.js";

export const ProductService = new ProductRepository(new Product());

export const getProductsService = async (req) => {
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const sort = req.query.sort || "";
  const category = req.query.category || "";
  const availability = parseInt(req.query.stock) || "";

  let filter = {};
  if (req.query.category) {
    filter = { category };
  }
  if (req.query.stock) {
    filter = { ...filter, stock: availability };
  }
  let sortOptions = {};
  if (sort === "asc") {
    sortOptions = { price: 1 };
  } else if (sort === "desc") {
    sortOptions = { price: -1 };
  }
  const options = {
    limit,
    page,
    sort: sortOptions,
    lean: true,
  };
  const result = await ProductService.getAllPaginate(filter, options);
  const totalPages = result.totalPages;
  const prevPage = result.prevPage;
  const nextPage = result.nextPage;
  const currentPage = result.page;
  const hasPrevPage = result.hasPrevPage;
  const hasNextPage = result.hasNextPage;
  const prevLink = hasPrevPage ? `/api/products?page=${prevPage}` : null;
  const nextLink = hasNextPage ? `/api/products?page=${nextPage}` : null;

  return {
    payload: result.docs,
    limit: result.limit,
    totalPages,
    prevPage,
    nextPage,
    page: currentPage,
    hasPrevPage,
    hasNextPage,
    prevLink,
    nextLink,
  };
};