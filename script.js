let cart = [];
        let isCartOpen = false;

        document.addEventListener('DOMContentLoaded', function() {
            loadCart();
            updateCartUI();
            document.getElementById('currentYear').textContent = new Date().getFullYear();
        });

        window.addEventListener('scroll', function() {
            document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 50);
        });

        function toggleMobileMenu() {
            document.getElementById('mobileMenu').classList.toggle('open');
        }

        function toggleCart() {
            isCartOpen = !isCartOpen;
            document.getElementById('cartBackdrop').classList.toggle('open', isCartOpen);
            document.getElementById('cartSidebar').classList.toggle('open', isCartOpen);
        }

        function addToCart(id, name, price, button) {
            const existing = cart.find(i => i.id === id);
            if (existing) existing.quantity++;
            else cart.push({ id, name, price, quantity: 1 });
            saveCart();
            updateCartUI();
            const orig = button.textContent;
            button.textContent = '✓ Added!';
            button.classList.add('added');
            setTimeout(() => { button.textContent = orig; button.classList.remove('added'); }, 2000);
        }

        function updateQuantity(id, qty) {
            if (qty <= 0) { removeFromCart(id); return; }
            const item = cart.find(i => i.id === id);
            if (item) { item.quantity = qty; saveCart(); updateCartUI(); }
        }

        function removeFromCart(id) {
            cart = cart.filter(i => i.id !== id);
            saveCart();
            updateCartUI();
        }

        function updateCartUI() {
            const cartItems = document.getElementById('cartItems');
            const cartTotal = document.getElementById('cartTotal');
            const cartBadge = document.getElementById('cartBadge');
            const totalAmount = document.getElementById('totalAmount');

            const totalQty = cart.reduce((s, i) => s + i.quantity, 0);
            cartBadge.textContent = totalQty;
            cartBadge.style.display = totalQty > 0 ? 'flex' : 'none';

            if (cart.length === 0) {
                cartItems.innerHTML = `<div class="cart-empty"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg><p>Your cart is empty.<br>Start shopping!</p></div>`;
                cartTotal.style.display = 'none';
            } else {
                cartItems.innerHTML = cart.map(item => `
                    <div class="cart-item">
                        <div class="cart-item-info">
                            <div class="cart-item-name">${item.name}</div>
                            <div class="cart-item-price">₹${item.price} each</div>
                        </div>
                        <div class="cart-item-controls">
                            <div class="quantity-controls">
                                <button class="quantity-btn" onclick="updateQuantity('${item.id}',${item.quantity-1})">−</button>
                                <span class="quantity-display">${item.quantity}</span>
                                <button class="quantity-btn" onclick="updateQuantity('${item.id}',${item.quantity+1})">+</button>
                            </div>
                            <button class="remove-btn" onclick="removeFromCart('${item.id}')">Remove</button>
                        </div>
                    </div>`).join('');
                const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
                totalAmount.textContent = `₹${total}`;
                cartTotal.style.display = 'block';
            }
        }

        function saveCart() {
            document.cookie = `popcornCart=${encodeURIComponent(JSON.stringify(cart))};path=/;max-age=2592000`;
        }

        function loadCart() {
            for (const c of document.cookie.split(';')) {
                const [k, v] = c.trim().split('=');
                if (k === 'popcornCart') { try { cart = JSON.parse(decodeURIComponent(v)); } catch(e) { cart = []; } break; }
            }
        }

        
// Open popup when "Proceed to Checkout" is clicked
(function hookCheckout() {
  // Wait for DOM to be ready, then find the checkout button
  function attach() {
    const btn = document.querySelector('.checkout-btn');
    if (btn) {
      btn.addEventListener('click', openOrderPopup);
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attach);
  } else {
    attach();
  }
})();

function openOrderPopup() {
  // Build cart summary from the sidebar items
  const summary = document.getElementById('popupCartSummary');
  const cartItemEls = document.querySelectorAll('.cart-item');
  
  if (cartItemEls.length === 0) {
    summary.style.display = 'none';
  } else {
    let html = '';
    let total = 0;
    cartItemEls.forEach(function(el) {
      const name  = el.querySelector('.item-name')  ? el.querySelector('.item-name').textContent  : '';
      const price = el.querySelector('.item-price') ? el.querySelector('.item-price').textContent : '';
      const qty   = el.querySelector('.item-qty')   ? el.querySelector('.item-qty').textContent   : '';
      // Try to parse total price from the item
      const priceNum = parseInt((price || '').replace(/[^0-9]/g,'')) || 0;
      total += priceNum;
      if (name) {
        html += `<div class="summary-row"><span>${name}${qty ? ' &times;' + qty.replace(/[^0-9]/g,'') : ''}</span><span>${price}</span></div>`;
      }
    });
    // Fallback: read total from the #totalAmount element
    const totalEl = document.getElementById('totalAmount');
    const totalText = totalEl ? totalEl.textContent : ('₹' + total);
    html += `<div class="summary-row summary-total"><span>Total</span><span>${totalText}</span></div>`;
    summary.innerHTML = html;
    summary.style.display = 'block';
  }

  document.getElementById('orderPopupBackdrop').classList.add('active');
  document.getElementById('orderPopup').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeOrderPopup() {
  document.getElementById('orderPopupBackdrop').classList.remove('active');
  document.getElementById('orderPopup').classList.remove('active');
  document.body.style.overflow = '';
}

// Close on Escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeOrderPopup();
});