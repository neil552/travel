document.addEventListener('DOMContentLoaded', function() {
    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    const hamburgerButton = document.getElementById('hamburger-button');
    const mobileMenu = document.getElementById('mobile-menu');

    if (hamburgerButton && mobileMenu) {
        hamburgerButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            const isMenuOpen = !mobileMenu.classList.contains('hidden');
            hamburgerButton.setAttribute('aria-expanded', isMenuOpen.toString());
            const iconSvg = hamburgerButton.querySelector('svg path');
            if (iconSvg) {
                if (isMenuOpen) {
                    iconSvg.setAttribute('d', 'M6 18L18 6M6 6l12 12');
                    hamburgerButton.setAttribute('aria-label', 'Cerrar menú');
                } else {
                    iconSvg.setAttribute('d', 'M4 6h16M4 12h16M4 18h16');
                    hamburgerButton.setAttribute('aria-label', 'Abrir menú');
                }
            }
        });
    }

    const cartCountElement = document.getElementById('cart-count');
    const cartItemsContainer = document.getElementById('cart-items');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const subtotalPriceElement = document.getElementById('subtotal-price');
    const taxesPriceElement = document.getElementById('taxes-price');
    const totalPriceElement = document.getElementById('total-price');
    const checkoutButton = document.getElementById('checkout-button');
    const cartSummary = document.getElementById('cart-summary');

    let cart = JSON.parse(localStorage.getItem('mundoTravelCart')) || [];

    function updateCartCount() {
        if (cartCountElement) {
            cartCountElement.textContent = cart.length;
        }
    }

    window.agregarAlCarrito = function(nombre, precio, fecha) {
        const itemExistente = cart.find(item => item.nombre === nombre && item.fecha === fecha);
        if (itemExistente) {
            itemExistente.cantidad = (itemExistente.cantidad || 1) + 1;
        } else {
            cart.push({ nombre, precio, fecha, cantidad: 1, id: Date.now() });
        }
        localStorage.setItem('mundoTravelCart', JSON.stringify(cart));
        updateCartCount();
        alert(`${nombre} ha sido añadido al carrito.`);
    }

    window.removerDelCarrito = function(itemId) {
        cart = cart.filter(item => item.id !== itemId);
        localStorage.setItem('mundoTravelCart', JSON.stringify(cart));
        renderizarItemsCarrito();
        updateCartCount();
    }

    window.cambiarCantidad = function(itemId, delta) {
        const item = cart.find(item => item.id === itemId);
        if (!item) return;

        item.cantidad += delta;
        if (item.cantidad <= 0) {
            if (confirm('¿Deseas eliminar este producto del carrito?')) {
                removerDelCarrito(itemId);
                return;
            } else {
                item.cantidad = 1;
            }
        }

        localStorage.setItem('mundoTravelCart', JSON.stringify(cart));
        renderizarItemsCarrito();
        updateCartCount();
    }

    function renderizarItemsCarrito() {
        if (!cartItemsContainer || !cartSummary) return;

        cartItemsContainer.innerHTML = '';
        if (cart.length === 0) {
            if(emptyCartMessage) emptyCartMessage.style.display = 'block';
            if(cartSummary) cartSummary.style.display = 'none';
            if(checkoutButton) checkoutButton.disabled = true;
            return;
        }

        if(emptyCartMessage) emptyCartMessage.style.display = 'none';
        if(cartSummary) cartSummary.style.display = 'block';
        if(checkoutButton) checkoutButton.disabled = false;

        let subtotal = 0;
        const header = document.createElement('div');
        header.className = 'grid grid-cols-5 gap-4 font-semibold border-b pb-2 mb-2 text-gray-700';
        header.innerHTML = `
            <span>Producto</span>
            <span class="text-center">Fecha</span>
            <span class="text-center">Precio Unit.</span>
            <span class="text-center">Cantidad</span>
            <span class="text-right">Acción</span>
        `;
        cartItemsContainer.appendChild(header);

        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'grid grid-cols-5 gap-4 items-center border-b py-3';
            itemElement.innerHTML = `
                <span class="font-medium text-blue-600">${item.nombre}</span>
                <span class="text-center text-sm text-gray-600">${item.fecha}</span>
                <span class="text-center text-gray-600">$${item.precio.toFixed(2)}</span>
                <span class="text-center text-gray-600">
                    <button onclick="cambiarCantidad(${item.id}, -1)" class="px-2 text-white bg-red-500 rounded">-</button>
                    <span class="px-2">${item.cantidad}</span>
                    <button onclick="cambiarCantidad(${item.id}, 1)" class="px-2 text-white bg-green-500 rounded">+</button>
                </span>
                <button onclick="removerDelCarrito(${item.id})" class="text-red-500 hover:text-red-700 text-right text-sm font-semibold">Eliminar</button>
            `;
            cartItemsContainer.appendChild(itemElement);
            subtotal += item.precio * item.cantidad;
        });

        const impuestos = subtotal * 0.10;
        const total = subtotal + impuestos;

        if(subtotalPriceElement) subtotalPriceElement.textContent = `$${subtotal.toFixed(2)}`;
        if(taxesPriceElement) taxesPriceElement.textContent = `$${impuestos.toFixed(2)}`;
        if(totalPriceElement) totalPriceElement.textContent = `$${total.toFixed(2)}`;
    }

    const contactForm = document.getElementById('contactForm');
    const formMessage = document.getElementById('form-message');

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const nombre = document.getElementById('nombre').value;
            const correo = document.getElementById('correo').value;

            if (formMessage) {
                formMessage.textContent = `Gracias ${nombre}, tu mensaje ha sido recibido. Te contactaremos pronto a ${correo}.`;
                formMessage.className = 'mt-4 text-sm text-green-600';
            }
            contactForm.reset();

            setTimeout(() => {
               if(formMessage) formMessage.textContent = '';
            }, 5000);
        });
    }

    const checkoutMessage = document.getElementById('checkout-message');
    if (checkoutButton) {
        checkoutButton.addEventListener('click', function() {
            if (cart.length > 0) {
                if(checkoutMessage) {
                    checkoutMessage.textContent = 'Procesando tu pago... ¡Gracias por tu compra!';
                    checkoutMessage.className = 'mt-4 text-sm text-green-600 text-center';
                }
                cart = [];
                localStorage.setItem('mundoTravelCart', JSON.stringify(cart));
                setTimeout(() => {
                    renderizarItemsCarrito();
                    updateCartCount();
                    if(checkoutMessage) checkoutMessage.textContent = '';
                    alert('¡Pago realizado con éxito! (Simulación)');
                }, 2000);
            } else {
                if(checkoutMessage) {
                    checkoutMessage.textContent = 'Tu carrito está vacío.';
                    checkoutMessage.className = 'mt-4 text-sm text-red-600 text-center';
                }
            }
        });
    }

    updateCartCount();
    if (window.location.pathname.endsWith('servicios.html')) {
        renderizarItemsCarrito();
    }
});
