const socket = io();

const form = document.getElementById("form");
const productsTable = document.querySelector("#productsTable");
const tbody = productsTable.querySelector("#tbody");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  const res = await fetch(form.action, {
    method: "POST",
    body: formData,
  });
  try {
    if (!res.ok) {
      throw new Error(result.error);
    } else {
      
      const resultProducts = await fetch("/api/products?limit=100");
      const results = await resultProducts.json();
      if (results.status === "error") {
        throw new Error(results.error);
      } else {
        
        socket.emit("productList", results.payload);

       
        Toastify({
          text: "new product added successfully",
          duration: 2000,
          newWindow: true,
          close: true,
          gravity: "top",
          position: "right",
          stopOnFocus: true,
          style: {
            background: "#008000",
          },
          onClick: function () {},
        }).showToast();
        
        form.reset();
      }
    }
  } catch (error) {
    console.log(error);
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

    Toastify({
      text: "product removed successfully",
      duration: 2000,
      newWindow: true,
      close: true,
      gravity: "bottom",
      position: "right",
      stopOnFocus: true,
      style: {
        background: "#ff0000",
      },
      onClick: function () {},
    }).showToast();
  } catch (error) {
    console.log(error);
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
        <td>
          <button onclick="deleteProduct('${item._id}')" id="btnDelete">Delete</button>
          <button onclick="updatedProduct('${item._id}')" id="btnUpdate">Update</button>
        </td>
        <td id="editForm_${item._id}" style="display: none;">
          <div>
            <label for="editStock">New Stock:</label>
            <input type="number" id="editStock_${item._id}" />
            <button onclick="updateStock('${item._id}')">Update Stock</button>
          </div>
        </td>
      `;
    tbody.appendChild(row);
  });
});