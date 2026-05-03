import http from "http";
import test from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";

import app from "../app.js";
import User from "../src/models/user.model.js";

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "test-secret";
}

async function startApp() {
  const server = http.createServer(app);

  await new Promise((res) =>
    server.listen(0, "127.0.0.1", res)
  );

  const port = server.address().port;

  return {
    server,
    url: `http://127.0.0.1:${port}`,
  };
}

const originalFindById = User.findById;

test("Admin routes protection", async (t) => {

  await t.test("unauthenticated → 401", async () => {
    const { server, url } = await startApp();

    const res = await fetch(`${url}/api/v1/admin/models`);

    assert.equal(res.status, 401);

    server.close();
  });

  await t.test("superadmin → access allowed", async () => {
    User.findById = async (id) => ({
      _id: id,
      role: "SUPERADMIN",
    });

    const { server, url } = await startApp();

    const token = jwt.sign(
      { id: "1", role: "SUPERADMIN" },
      process.env.JWT_SECRET
    );

    const res = await fetch(`${url}/api/v1/admin/models`, {
      headers: {
        cookie: `token=${token}`,
      },
    });

    assert.equal(res.status, 200);

    User.findById = originalFindById;
    server.close();
  });

  await t.test("admin cannot escalate role → 403", async () => {
    User.findById = async (id) => ({
      _id: id,
      role: "ADMIN",
    });

    const { server, url } = await startApp();

    const token = jwt.sign(
      { id: "admin", role: "ADMIN" },
      process.env.JWT_SECRET
    );

    const res = await fetch(
      `${url}/api/v1/admin/user/000000000000000000000001`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          cookie: `token=${token}`,
        },
        body: JSON.stringify({ role: "SUPERADMIN" }),
      }
    );

    assert.equal(res.status, 403);

    User.findById = originalFindById;
    server.close();
  });

});