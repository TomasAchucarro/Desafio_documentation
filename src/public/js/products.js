const socket = io();

const cartLink = document?.getElementById("cart");
const hrefValue = cartLink?.getAttribute("href");
const cart = hrefValue?.match(/\/products\/carts\/(.+)/)[1];
const addCart = async (id) => {
  try {
    const res = await fetch(`/api/carts/${cart}/product/${id}`, {
      method: "POST",
    });
    const result = await res.json();
    if (result.status === "error") throw new Error(result.error);

    Toastify({
      text: "product add to cart successfully",
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
  } catch (error) {
    console.log(error);
  }
};

const addProductToCart = async (id, prodCart) => {
  try {
    const res = await fetch(`/api/carts/${prodCart}/product/${id}`, {
      method: "POST",
    });
    const result = await res.json();
    if (result.status === "error") throw new Error(result.error);

    Toastify({
      text: "product add to cart successfully",
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
  } catch (error) {
    console.log(error);
  }
};

const deleteProduct = async (id) => {
  const userCart = window.location.pathname.match(/\/products\/carts\/(.+)/)[1];
  try {
    const res = await fetch(`/api/carts/${userCart}/product/${id}`, {
      method: "DELETE",
    });
    const result = await res.json();
    if (result.status === "error") throw new Error(result.error);
    else socket.emit("cartList", result);

    Toastify({
      text: "product delete to cart successfully",
      duration: 2000,
      newWindow: true,
      close: true,
      gravity: "top",
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

const purchaseProducts = async () => {
  const cartEmpty = window.location.pathname.match(
    /\/products\/carts\/(.+)/
  )[1];
  try {
    Swal.fire({
      title: 'Confirm the purchase?',
      text: "Products out of stock will not be added to the purchase!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, confirm!'
    }).then((result) => {
      if (result.isConfirmed) {
        setTimeout(() => {
          window.location.href = `/api/carts/${cartEmpty}/purchase`;
        }, 500)
      }
    })
  } catch (error) {
    console.log(error);
  }
};

const cartBody = document.querySelector("#cartBody");
const generateProductHTML = (prod) => {
  return `<div style="position: relative;">
         <button
         style="position: absolute; top:0; right:0"
         onclick="deleteProduct('${prod.product._id}')"
         >X</button>
         <div>
           <div>
             <div>
               <img src="/img/${prod.product.thumbnails[0]}" alt="${prod.product.title}"/>
             </div>
             <div>
               <p>${prod.product.title}</p>
               <p><span>Category:
                 </span>${prod.product.category}</p>
             </div>
             <div>
  
               <label>Quantity</label>
               <input type="number" value=${prod.quantity}
                 readonly />
             </div>
             <div>
               <h5>$${prod.product.price}</h5>
             </div>
             <div>
               <a href="#!"><i></i></a>
             </div>
           </div>
         </div>
       </div>`;
}

// Escucha el evento "updatedCarts" emitido por el servidor
socket.on("updatedCarts", (data) => {

  const productsHTML = data.payload.products
      .map((prod) => generateProductHTML(prod))
      .join("");

  if (data.payload.products.length > 0) {
    cartBody.innerHTML = `
    <div id="cartBody">
    <div>
      <div>
  
        <div>
          <h3>Shopping Cart</h3>
          <div>
            <p><span>Sort by:</span>
              <a href="#!">price
                <i></i></a>
            </p>
          </div>
        </div>
        ${productsHTML}
        <div>
          <div>
            <button type="button" onclick="purchaseProducts()">Buy Now</button>
          </div>
        </div>
  
      </div>
    </div>
  </div>
    `;
  } else {
    cartBody.innerHTML = `
    <div>
      <h2>Cart Empty</h2>
    </div>`;
  }
});