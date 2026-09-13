const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// ============================================
// ТОВАРЫ — меняй здесь под себя
// category — категория (должна совпадать с одной из в categories)
// ============================================
const products = [
    { id: 1, name: 'Футболка Oversize', price: 1900, category: 'Футболки', img: 'b12d4490609f200b0073baf8f0fe4c79.jpg' },
    { id: 2, name: 'Худи унисекс', price: 3500, category: 'Худи', img: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400' },
    { id: 3, name: 'Джинсы Slim', price: 4200, category: 'Джинсы', img: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400' },
    { id: 4, name: 'Куртка Bomber', price: 6800, category: 'Куртки', img: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400' },
    { id: 5, name: 'Кепка', price: 1200, category: 'Аксессуары', img: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400' },
    { id: 6, name: 'Кроссовки', price: 7500, category: 'Обувь', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400' },
    { id: 7, name: 'Футболка белая', price: 1500, category: 'Футболки', img: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400' },
    { id: 8, name: 'Худи чёрное', price: 3900, category: 'Худи', img: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400' },
];

// ============================================
// КОРЗИНА: { id: количество }
// ============================================
let cart = {};
let currentCategory = 'Все';

// ============================================
// КАТЕГОРИИ
// ============================================
const categories = ['Все', ...new Set(products.map(p => p.category))];
const categoriesEl = document.getElementById('categories');

categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'cat-btn' + (cat === currentCategory ? ' active' : '');
    btn.innerText = cat;
    btn.dataset.cat = cat;
    categoriesEl.appendChild(btn);
});

categoriesEl.addEventListener('click', (e) => {
    if (e.target.classList.contains('cat-btn')) {
        currentCategory = e.target.dataset.cat;
        document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        renderProducts();
    }
});

// ============================================
// ОТРИСОВКА ТОВАРОВ
// ============================================
const productsEl = document.getElementById('products');

function renderProducts() {
    productsEl.innerHTML = '';
    const filtered = currentCategory === 'Все'
        ? products
        : products.filter(p => p.category === currentCategory);

    filtered.forEach(p => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <img src="${p.img}" alt="${p.name}" loading="lazy">
            <h3>${p.name}</h3>
            <div class="price">${p.price} ₽</div>
            <button data-id="${p.id}">В корзину</button>
        `;
        productsEl.appendChild(card);
    });
}

renderProducts();

// ============================================
// ДОБАВЛЕНИЕ В КОРЗИНУ
// ============================================
productsEl.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
        const id = Number(e.target.dataset.id);
        cart[id] = (cart[id] || 0) + 1;
        updateCart();
        tg.HapticFeedback?.impactOccurred('light');
    }
});

// ============================================
// ОБНОВЛЕНИЕ СЧЁТЧИКОВ
// ============================================
function updateCart() {
    let count = 0;
    let total = 0;
    for (const id in cart) {
        const product = products.find(p => p.id === Number(id));
        count += cart[id];
        total += product.price * cart[id];
    }
    document.getElementById('cartCount').innerText = count;
    document.getElementById('cartTotal').innerText = total;
    document.getElementById('modalTotal').innerText = total + ' ₽';
    renderCartItems();
}

// ============================================
// ОТРИСОВКА КОРЗИНЫ В МОДАЛКЕ
// ============================================
function renderCartItems() {
    const container = document.getElementById('cartItems');
    container.innerHTML = '';

    if (Object.keys(cart).length === 0) {
        container.innerHTML = '<p style="opacity:0.6;padding:20px 0;text-align:center;">Корзина пуста</p>';
        return;
    }

    for (const id in cart) {
        const p = products.find(prod => prod.id === Number(id));
        const item = document.createElement('div');
        item.className = 'cart-item';
        item.innerHTML = `
            <img src="${p.img}" alt="${p.name}">
            <div class="cart-item-info">
                <h4>${p.name}</h4>
                <span>${p.price} ₽ × ${cart[id]} = ${p.price * cart[id]} ₽</span>
            </div>
            <div class="qty-controls">
                <button data-action="minus" data-id="${p.id}">−</button>
                <span>${cart[id]}</span>
                <button data-action="plus" data-id="${p.id}">+</button>
            </div>
        `;
        container.appendChild(item);
    }
}

// ============================================
// УПРАВЛЕНИЕ КОЛИЧЕСТВОМ В КОРЗИНЕ
// ============================================
document.getElementById('cartItems').addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    const id = Number(btn.dataset.id);
    const action = btn.dataset.action;

    if (action === 'plus') {
        cart[id]++;
    } else if (action === 'minus') {
        cart[id]--;
        if (cart[id] <= 0) delete cart[id];
    }
    updateCart();
});

// ============================================
// ОТКРЫТИЕ / ЗАКРЫТИЕ КОРЗИНЫ
// ============================================
const modal = document.getElementById('cartModal');
document.getElementById('openCartBtn').addEventListener('click', () => {
    renderCartItems();
    modal.classList.add('open');
});
document.getElementById('closeCartBtn').addEventListener('click', () => {
    modal.classList.remove('open');
});
modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('open');
});

// ============================================
// ОФОРМЛЕНИЕ ЗАКАЗА
// ============================================
document.getElementById('checkoutBtn').addEventListener('click', () => {
    if (Object.keys(cart).length === 0) {
        tg.showAlert('Корзина пуста! Добавь товары.');
        return;
    }

    const order = [];
    let total = 0;
    for (const id in cart) {
        const p = products.find(prod => prod.id === Number(id));
        order.push({
            name: p.name,
            price: p.price,
            qty: cart[id],
            sum: p.price * cart[id]
        });
        total += p.price * cart[id];
    }

    const orderText = order.map(i => `${i.name} × ${i.qty} = ${i.sum} ₽`).join('\n');

    // Показываем подтверждение
    tg.showConfirm(`Ваш заказ:\n\n${orderText}\n\nИтого: ${total} ₽\n\nПодтвердить?`, (ok) => {
        if (ok) {
            tg.sendData(JSON.stringify({
                action: 'new_order',
                items: order,
                total: total,
                user: tg.initDataUnsafe?.user?.first_name || 'Гость'
            }));
            tg.close();
        }
    });
});
