import { Router } from "express";
import jwt from "jsonwebtoken";
import { PRIVATE_KEY, SIGNED_COOKIE_KEY } from "../config/config.js";
import { cookieExtractor } from "../config/passport.config.js";

export default class appRouter {
  constructor() {
    this.router = Router();
    this.init();
  }
  getRouter() {
    return this.router;
  }
  init() {}

  get(path,policies, ...callbacks) {
    this.router.get(
      path,
      this.handlePolicies(policies),
      this.generateCustomResponses,
      this.applyCallbacks(callbacks)
    );
  }
  post(path,policies, ...callbacks) {
    this.router.post(
      path,
      this.handlePolicies(policies),
      this.generateCustomResponses,
      this.applyCallbacks(callbacks)
    );
  }
  put(path,policies, ...callbacks) {
    this.router.put(
      path,
      this.handlePolicies(policies),
      this.generateCustomResponses,
      this.applyCallbacks(callbacks)
    );
  }
  delete(path,policies, ...callbacks) {
    this.router.delete(
      path,
      this.handlePolicies(policies),
      this.generateCustomResponses,
      this.applyCallbacks(callbacks)
    );
  }

  applyCallbacks(callbacks) {
    return callbacks.map((callback) => async (...params) => {
      try {
        await callback.apply(this, params);
      } catch (error) {
        console.log(error);
        params[1].status(500).json({ error });
      }
    });
  }

  generateCustomResponses = (req, res, next) => {
    res.sendSuccess = (payload) => res.json({ status: "success", payload });
    res.createdSuccess = (payload) => res.status(201).json({ status: "success", payload });
    res.sendServerError = (error) =>
      res.status(500).json({ status: "error", error });
    res.sendUserError = (error) =>
      res.status(400).json({ status: "error", error });
      res.authFailError = (error) =>
      res.status(401).json({ status: "error", error });
    res.sendRequestError = (error) =>
      res.status(404).json({ status: "error", error });
    next();
  };

  handlePolicies = policies => (req, res, next) => {
    if(policies[0]==="PUBLIC") return next();
    const authHeaders = req.signedCookies[SIGNED_COOKIE_KEY];
    if(!authHeaders) return res.status(401).render("errors/errorPage", {
      status: "error",
      error: "Unauthorized",
    });
    const token = cookieExtractor(req);
    let user = jwt.verify(token, PRIVATE_KEY);
    
    if(!policies.includes(user.user.role.toUpperCase())) return res.status(403).render("errors/errorPage", {
      status: "error",
      error: "No authorized",
    });
    req.user=user;
    next();
  }
}