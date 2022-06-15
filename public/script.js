const checkoutBtn = document
  .querySelector("#checkout")
  .addEventListener("click", runFunc);

function runFunc() {
  fetch("checkout/create-checkout-session", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      items: [
        { id: 1, quantity: 3 },
        { id: 2, quantity: 1 },
      ],
    }),
  })
    .then((res) => {
      if (res.ok) return res.json();
      //if error
      return res.json().then((json) => Promise.reject(json));
    })
    .then(({ url }) => {
      console.log(url);
      window.location = url;
    })
    .catch((e) => {
      console.error(e.error);
    });
}
