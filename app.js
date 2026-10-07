const products = [
  { id: "sneakers", name: "حذاء بخطوط كلاسيكية", category: "أزياء", price: 48, tag: "اختيار الأسبوع", image: "photo-1542291026-7eec264c27ff" },
  { id: "headphones", name: "سماعات استماع يومية", category: "تقنية", price: 72, tag: "الأكثر طلبًا", image: "photo-1505740420928-5e560c06d30e" },
  { id: "vase", name: "مزهرية سيراميك يدوية", category: "منزل", price: 36, tag: "صنع يدوي", image: "photo-1578500494198-246f612d3b3d" },
  { id: "watch", name: "ساعة بوجه بسيط", category: "أزياء", price: 95, tag: "وصل حديثًا", image: "photo-1523275335684-37898b6baf30" },
  { id: "camera", name: "كاميرا فورية صغيرة", category: "تقنية", price: 64, tag: "اختيار البائع", image: "photo-1526170375885-4d8ecf77b99f" },
  { id: "skincare", name: "زيت عناية طبيعي", category: "عناية", price: 22, tag: "مكونات طبيعية", image: "photo-1608248543803-ba4f8c70ae0b" },
];

const productGrid = document.querySelector("#product-grid");
const searchInput = document.querySelector("#search-input");
const categoryList = document.querySelector("#category-list");
const resultCount = document.querySelector("#result-count");
const emptyState = document.querySelector("#empty-state");
const cartDrawer = document.querySelector("#cart-drawer");
const drawerBackdrop = document.querySelector("#drawer-backdrop");
const cartItems = document.querySelector("#cart-items");
const cartEmpty = document.querySelector("#cart-empty");
const cartFooter = document.querySelector("#cart-footer");
const cartCount = document.querySelector("#cart-count");
const toast = document.querySelector("#toast");
const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const digitFormat = new Intl.NumberFormat("ar");

let activeCategory = "الكل";
let cart = readCart();
let toastTimer;

function readCart() {
  try {
    const saved = JSON.parse(localStorage.getItem("sarhatstore-cart") || "[]");
    return Array.isArray(saved) ? saved.filter((item) => products.some((product) => product.id === item.id) && Number.isInteger(item.quantity) && item.quantity > 0) : [];
  } catch {
    return [];
  }
}

function saveCart() {
  localStorage.setItem("sarhatstore-cart", JSON.stringify(cart));
}

function imageUrl(image, width = 640) {
  return `https://images.unsplash.com/${image}?auto=format&fit=crop&w=${width}&q=82`;
}

function renderProducts() {
  const query = searchInput.value.trim().toLocaleLowerCase("ar");
  const visibleProducts = products.filter((product) => {
    const matchesCategory = activeCategory === "الكل" || product.category === activeCategory;
    return matchesCategory && `${product.name} ${product.category}`.toLocaleLowerCase("ar").includes(query);
  });

  productGrid.innerHTML = visibleProducts.map((product) => `
    <article class="product-card">
      <div class="product-image-wrap">
        <img class="product-image" src="${imageUrl(product.image)}" alt="${product.name}" loading="lazy">
        <span class="product-tag">${product.tag}</span>
      </div>
      <div class="product-info">
        <p class="product-category">${product.category}</p>
        <h3 class="product-name">${product.name}</h3>
        <div class="product-bottom">
          <span class="product-price">${currency.format(product.price)}</span>
          <button class="add-button" type="button" data-add="${product.id}" aria-label="أضف ${product.name} إلى السلة">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>أضف للسلة
          </button>
        </div>
      </div>
    </article>`).join("");

  resultCount.textContent = `${digitFormat.format(visibleProducts.length)} ${visibleProducts.length === 1 ? "منتج" : "منتجات"}`;
  emptyState.hidden = visibleProducts.length > 0;
}

function renderCart() {
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = digitFormat.format(totalQuantity);
  cartEmpty.hidden = cart.length > 0;
  cartFooter.hidden = cart.length === 0;
  cartItems.innerHTML = cart.map((item) => {
    const product = products.find((entry) => entry.id === item.id);
    return `<article class="cart-line">
      <img src="${imageUrl(product.image, 180)}" alt="" loading="lazy">
      <div>
        <h3>${product.name}</h3><p>${currency.format(product.price)}</p>
        <div class="quantity-control" aria-label="الكمية">
          <button type="button" data-change="${product.id}" data-delta="-1" aria-label="تقليل الكمية">−</button>
          <span>${digitFormat.format(item.quantity)}</span>
          <button type="button" data-change="${product.id}" data-delta="1" aria-label="زيادة الكمية">+</button>
        </div>
      </div>
      <button class="remove-item" type="button" data-remove="${product.id}" aria-label="إزالة ${product.name}">حذف</button>
    </article>`;
  }).join("");

  const total = cart.reduce((sum, item) => sum + products.find((product) => product.id === item.id).price * item.quantity, 0);
  document.querySelector("#cart-total").textContent = currency.format(total);
  saveCart();
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2200);
}

function setCartOpen(isOpen) {
  cartDrawer.classList.toggle("open", isOpen);
  cartDrawer.setAttribute("aria-hidden", String(!isOpen));
  cartDrawer.inert = !isOpen;
  drawerBackdrop.hidden = !isOpen;
  requestAnimationFrame(() => drawerBackdrop.classList.toggle("visible", isOpen));
  document.body.style.overflow = isOpen ? "hidden" : "";
  if (isOpen) document.querySelector("#close-cart").focus();
}

categoryList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  activeCategory = button.dataset.category;
  categoryList.querySelectorAll("[data-category]").forEach((item) => {
    const selected = item === button;
    item.classList.toggle("selected", selected);
    item.setAttribute("aria-pressed", String(selected));
  });
  renderProducts();
});

searchInput.addEventListener("input", renderProducts);
productGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-add]");
  if (!button) return;
  const item = cart.find((entry) => entry.id === button.dataset.add);
  if (item) item.quantity += 1;
  else cart.push({ id: button.dataset.add, quantity: 1 });
  renderCart();
  showToast("أُضيف المنتج إلى سلتك");
});

cartItems.addEventListener("click", (event) => {
  const changeButton = event.target.closest("[data-change]");
  const removeButton = event.target.closest("[data-remove]");
  if (changeButton) {
    const item = cart.find((entry) => entry.id === changeButton.dataset.change);
    item.quantity += Number(changeButton.dataset.delta);
    cart = cart.filter((entry) => entry.quantity > 0);
    renderCart();
  } else if (removeButton) {
    cart = cart.filter((entry) => entry.id !== removeButton.dataset.remove);
    renderCart();
  }
});

document.querySelector("#cart-trigger").addEventListener("click", () => setCartOpen(true));
document.querySelector("#close-cart").addEventListener("click", () => setCartOpen(false));
document.querySelector("#continue-shopping").addEventListener("click", () => setCartOpen(false));
drawerBackdrop.addEventListener("click", () => setCartOpen(false));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && cartDrawer.classList.contains("open")) setCartOpen(false);
  if (event.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
    event.preventDefault();
    searchInput.focus();
  }
});

document.querySelector("#checkout-form").addEventListener("submit", (event) => {
  event.preventDefault();
  if (cart.length === 0) return;

  const formData = new FormData(event.currentTarget);
  const lines = cart.map((item) => {
    const product = products.find((entry) => entry.id === item.id);
    return `- ${product.name} × ${item.quantity}: ${currency.format(product.price * item.quantity)}`;
  });
  const total = cart.reduce((sum, item) => sum + products.find((product) => product.id === item.id).price * item.quantity, 0);
  const message = [
    "طلب جديد من sarhatstore",
    `الاسم: ${formData.get("customerName")}`,
    `الهاتف: ${formData.get("customerPhone")}`,
    `العنوان: ${formData.get("customerAddress")}`,
    "",
    ...lines,
    `المجموع: ${currency.format(total)}`,
  ].join("\n");

  if (navigator.share) {
    navigator.share({ title: "طلب جديد من sarhatstore", text: message }).catch((error) => {
      if (error.name !== "AbortError") {
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
      }
    });
    return;
  }

  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
});

document.querySelector("#year").textContent = new Date().getFullYear();
renderProducts();
renderCart();