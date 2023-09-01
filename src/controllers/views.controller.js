import { ProductService, getProductsService } from "../services/products.service.js";
import { CartService } from "../services/carts.service.js";
import { ChatService } from "../services/chats.service.js";

export const getProductsViewsController = async (req, res) => {
  try {
    const products = await getProductsService(req);

    for (const product of products.payload) {
      product.stock === 0 ? product.status = false : product.status = true
      await ProductService.update(product._id, { status: product.status });
    }

    const user = req.user.user;
    let userAdmin;
    let onlyUser;
    if (user) {
      userAdmin = user?.role === "admin" ? true : false;
      onlyUser = user?.role === "user" ? true : false;
    }
    
    res.render("products", { products, user, userAdmin, onlyUser });
  } catch (error) {
    console.log(error);
    return res.sendServerError(error);
  }
};

export const getRealTimeProductsController = async (req, res) => {
  try {
    const result = await getProductsService(req);
    const allProducts = result.payload;
    res.render("realTimeProducts", { allProducts: allProducts });
  } catch (error) {
    console.log(error);
    return res.sendServerError(error);
  }
};

export const getChatController = async (req, res) => {
  try {
    const messages = await ChatService.getMessages();
    res.render("chat", { messages });
  } catch (error) {
    console.log(error);
    return res.sendServerError(error);
  }
};

export const getProductsByIdViewController = async (req, res) => {
  try {
    const pid = req.params.pid;
    const product = await ProductService.getById(pid);
    if (!product) return res.render("errors/errorPage", {error: "The product does not exist"});
    const user = req.user.user;
    let userAdmin;
    let onlyUser;
    if (user) {
      userAdmin = user?.role === "admin" ? true : false;
      onlyUser = user?.role === "user" ? true : false;
    }
    res.render("product", { product, user, userAdmin, onlyUser });
  } catch (error) {
    console.log(error);
    return res.sendServerError(error);
  }
};

export const getCartViewController = async (req, res) => {
  try {
    const cid = req.params.cid;
    const cart = await CartService.getCart(cid);
    if (cart.status === "error") return res.sendRequestError(cart.message);
    if (cart === null || cart.products.length === 0) {
      const emptyCart = "Cart Empty";
      req.app.get("socketio").emit("updatedCarts", cart.products);
      return res.render("carts", { emptyCart });
    }
    const carts = cart.products;
    req.app.get("socketio").emit("updatedCarts", carts);

    res.render("carts", { carts });
  } catch (error) {
    console.log(error);
    return res.sendServerError(error);
  }
};