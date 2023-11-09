import { sendingEmailDeletedProduct } from "../services/nodemailer/mailer.js";
import { ProductService } from "../services/products.service.js";
import { UserService } from "../services/users.service.js";
import { devLogger } from "../utils/logger.js";

export const getProductsController = async (req, res) => {
  try {
    const result = await ProductService.getAll();
    return res.sendSuccess(result);
  } catch (error) {
    devLogger.error(error);
    return res.sendServerError(error.message);
  }
};

export const getProductsByIdController = async (req, res) => {
  try {
    const pid = req.params.pid;
    const result = await ProductService.getById(pid);
    if (!result) return res.sendRequestError("The product does not exist");
    res.sendSuccess(result);
  } catch (error) {
    devLogger.error(error);
    res.sendServerError(error.message);
  }
};

export const addProductsController = async (req, res) => {
  try {
    if (!req.files) {
      devLogger.info("No image");
    }
    if (!req.body)
      return res.sendUserError("Product no can be created without properties");
    let product = {
      title: req.body.title,
      description: req.body.description,
      price: parseFloat(req.body.price),
      thumbnails: [req?.files[0]?.originalname] || [],
      code: req.body.code,
      category: req.body.category,
      stock: parseInt(req.body.stock),
    };

    product.owner =
      req.user.user && req.user.user.role === "premium"
        ? req.user.user._id
        : "admin";

    const result = await ProductService.create(product);
    const products = await ProductService.getAll();
    req.app.get("socketio").emit("updatedProducts", products);
    res.createdSuccess(result);
  } catch (error) {
    devLogger.error(error.message);
    return res.sendServerError(error.message);
  }
};

export const updateProductsController = async (req, res) => {
  try {
    const pid = req.params.pid;
    const updated = req.body;
    const productFind = await ProductService.getById(pid);
    if (!productFind) return sendRequestError("The product does not exist");

    if (
      req.user.user.role !== "admin" &&
      productFind?.owner !== req.user.user._id
    )
      return res.sendUserError(
        "You are not authorized to update this product."
      );

    if (updated._id === pid)
      return res.sendUserError("Cannot modify product id");

    await ProductService.update(pid, updated);

    const products = await ProductService.getAll();
    req.app.get("socketio").emit("updatedProducts", products);

    res.sendSuccess(products);
  } catch (error) {
    devLogger.error(error);
    res.sendServerError(error);
  }
};

export const deleteProductsController = async (req, res) => {
  try {
    const pid = req.params.pid;
    const product = await ProductService.getById(pid);

    if (!product) {
      return res.sendRequestError(`No such product with id: ${pid}`);
    }

    if (
      req.user.user.role !== "admin" &&
      product?.owner !== req.user.user._id
    ) {
      return res.sendUserError(
        "You are not authorized to delete this product."
      );
    }
    if (product.owner !== "admin") {
      const owner = await UserService.findById(product.owner);
      owner && await sendingEmailDeletedProduct(owner, product);
    }
    const result = await ProductService.delete(pid);
    if (!result) {
      return res.sendRequestError(`No such product with id: ${pid}`);
    }

    const products = await ProductService.getAll();
    req.app.get("socketio").emit("updatedProducts", products);

    res.sendSuccess(products);
  } catch (error) {
    devLogger.error(error);
    return res.sendServerError(error.message);
  }
};