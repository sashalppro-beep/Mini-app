const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// ============================================
// ТОВАРЫ — меняй здесь под себя
// id       — уникальный номер
// name     — название
// price    — цена (только цифры)
// category — категория (новая появится автоматически)
// img      — ссылка HTTPS или путь к файлу в репозитории
// ============================================
const products = [
    { id: 1, name: 'Майка Flair', price: 499, category: 'Футболки', img: 'file_0000000055b8820a9d7fe1163755e8a1.png' },
    { id: 2, name: 'Худи Nike', price: 799, category: 'Худи', img: 'IMG_20260913_124224_923.jpg' },
    { id: 3, name: 'Джинсы Slim Blue', price: 1890, category: 'Джинсы,Штаны', img: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500' },
    { id: 4, name: 'Куртка Bomber', price: 2790, category: 'Куртки', img: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500' },
    { id: 5, name: 'Кепка Classic', price: 490, category: 'Аксессуары', img: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500' },
    { id: 6, name: 'Кроссовки Flair', price: 1299, category: 'Обувь', img: 'file_000000004e0481f49f446dcad0ccbace.png' },
    { id: 7, name: 'Футболка White', price: 790, category: 'Футболки', img: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500' },
    { id: 8, name: 'Худи Black', price: 1590, category: 'Худи', img: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500' },
];

let cart = {};
let currentCategory = 'Все';
const INITIAL_LIMIT = 4;
let showAll = false;

// ============================================
// ШАБЛОН КАРТОЧКИ
// ============================================
function cardTemplate(p) {
    return `
        <div class="card-img-wrap">
            <img src="${p.img}" alt="${p.name}" loading="lazy"
                 onerror="this.src='https://via.placeholder.com/400x400/f2f2f2/999?text=no+image'">
            <button class="card-add" data-id="${p.id}">+</button>
        </div>
        <div class="card-info">
            <h3>${p.name}</h3>
            <div class="price">${p.price} MDL</div>
        </div>
    `;
}

// ============================================
// НОВИНКИ (карусель)
// ============================================
const newEl = document.getElementById('newProducts');
products.slice(0, 6).forEach(p => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = cardTemplate(p);
    newEl.appendChild(card);
});

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
        showAll = false;
        renderProducts();
    }
});

// ============================================
// ВСЕ ТОВАРЫ
// ============================================
const productsEl = document.getElementById('products');
const viewAllWrap = document.getElementById('viewAllWrap');

function renderProducts() {
    productsEl.innerHTML = '';
    const filtered = currentCategory === 'Все'
        ? products
        : products.filter(p => p.category === currentCategory);

    const visible = showAll ? filtered : filtered.slice(0, INITIAL_LIMIT);
    visible.forEach(p => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = cardTemplate(p);
        productsEl.appendChild(card);
    });

    viewAllWrap.style.display = (!showAll && filtered.length > INITIAL_LIMIT) ? 'block' : 'none';
}

document.getElementById('viewAllBtn').addEventListener('click', () => {
    showAll = true;
    renderProducts();
});

renderProducts();

// ============================================
// ДОБАВЛЕНИЕ В КОРЗИНУ
// ============================================
document.body.addEventListener('click', (e) => {
    const btn = e.target.closest('.card-add');
    if (btn) {
        e.stopPropagation();
        const id = Number(btn.dataset.id);
        cart[id] = (cart[id] || 0) + 1;
        updateCart();
        tg.HapticFeedback?.impactOccurred('light');
    }
});

// ============================================
// ОБНОВЛЕНИЕ КОРЗИНЫ
// ============================================
function updateCart() {
    let count = 0, total = 0;
    for (const id in cart) {
        const p = products.find(prod => prod.id === Number(id));
        count += cart[id];
        total += p.price * cart[id];
    }
    document.getElementById('cartBadge').innerText = count;
    document.getElementById('barCount').innerText = count;
    document.getElementById('barTotal').innerText = total;
    document.getElementById('modalTotal').innerText = total + ' MDL';
    renderCartItems();
}

function renderCartItems() {
    const container = document.getElementById('cartItems');
    container.innerHTML = '';
    if (Object.keys(cart).length === 0) {
        container.innerHTML = '<p style="opacity:0.5;padding:24px 0;text-align:center;">Корзина пуста</p>';
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
                <span>${p.price} MDL</span>
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

document.getElementById('cartItems').addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const id = Number(btn.dataset.id);
    if (btn.dataset.action === 'plus') cart[id]++;
    else if (btn.dataset.action === 'minus') {
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
document.getElementById('cartIconBtn').addEventListener('click', () => {
    renderCartItems();
    modal.classList.add('open');
});
document.getElementById('closeCartBtn').addEventListener('click', () => modal.classList.remove('open'));
modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('open'); });

// ============================================
// ОФОРМЛЕНИЕ ЗАКАЗА
// ============================================
document.getElementById('checkoutBtn').addEventListener('click', () => {
    if (Object.keys(cart).length === 0) {
        tg.showAlert('Корзина пуста!');
        return;
    }
    const order = [];
    let total = 0;
    for (const id in cart) {
        const p = products.find(prod => prod.id === Number(id));
        order.push({ name: p.name, price: p.price, qty: cart[id], sum: p.price * cart[id] });
        total += p.price * cart[id];
    }
    const orderText = order.map(i => `${i.name} × ${i.qty} = ${i.sum} MDL`).join('\n');
    tg.showConfirm(`Ваш заказ:\n\n${orderText}\n\nИтого: ${total} MDL\n\nПодтвердить?`, (ok) => {
        if (ok) {
            tg.sendData(JSON.stringify({
                action: 'new_order',
                items: order,
                total,
                user: tg.initDataUnsafe?.user?.first_name || 'Гость'
            }));
            tg.close();
        }
    });
});
