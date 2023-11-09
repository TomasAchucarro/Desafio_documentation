const socket = io();

const form = document.getElementById("form");
const productsTable = document.querySelector("#productsTable");
const tbody = productsTable.querySelector("#tbody");

const message = (message, gravity, position, color) => {
  return Toastify({
    text: `${message}`,
    duration: 3000,
    newWindow: true,
    close: true,
    gravity: `${gravity}`,
    position: `${position}`,
    stopOnFocus: true,
    style: {
      background: `${color}`,
    },
    onClick: function () {},
  }).showToast();
};

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  const res = await fetch(form.action, {
    method: "POST",
    body: formData,
  });
  try {
    if (!res.ok) {
      throw new Error(res.error);
    } else {
      const resultProducts = await fetch("/api/products?limit=100");
      const results = await resultProducts.json();
      if (results.status === "error") {
        throw new Error(results.error);
      } else {
        socket.emit("productList", results.payload);

        message("new product added successfully", "top", "right", "#008000");
        form.reset();
      }
    }
  } catch (error) {
    message(`${error}`, "bottom", "center", "#ff0000");
  }
});

const deleteProduct = async (id) => {
  try {
    const res = await fetch(`/api/products/${id}`, {
      method: "DELETE",
    });
    const result = await res.json();
    if (result.status === "error") throw new Error(result.error);
    else socket.emit("productList", result.payload);

    message("product removed successfully", "bottom", "right", "#ff0000");
    
  } catch (error) {
    message(`${error}`, "bottom", "center", "#ff0000");
  }
};

socket.on("updatedProducts", (products) => {
  tbody.innerHTML = "";
  products.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${item.title}</td>
        <td>${item.description}</td>
        <td>${item.price}</td>
        <td>${item.code}</td>
        <td>${item.category}</td>
        <td>${item.stock}</td>
        <td class="d-flex justify-content-between">
          <button class="btn btn-danger mx-1" onclick="deleteProduct('${item._id}')" id="btnDelete">Delete</button>
          <button class="btn btn-info mx-1" onclick="updatedProduct('${item._id}')" id="btnUpdate">Update</button>
        </td>
        <td id="editForm_${item._id}" style="display: none;">
          <div class="product-edit-form">
            <label for="editStock">New Stock:</label>
            <input type="number" id="editStock_${item._id}" />
            <button class="btn btn-info" onclick="updateStock('${item._id}')">Update Stock</button>
          </div>
        </td>
      `;
    tbody.appendChild(row);
  });
});