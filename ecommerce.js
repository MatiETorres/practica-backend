class Prenda {
  constructor(nombre, precio, stockInicial) {
    this.nombre = nombre;
    this.precio = precio;
    this.stock = stockInicial;
    this.stockInicial = stockInicial;
  }

  verificarStock() {
    return this.stock > 0;
  }

  restaurarStock() {
    this.stock = this.stockInicial;
  }
}

class Carrito {
  constructor() {
    this.items = [];
  }

  agregarPrenda(prenda) {
    if (prenda.verificarStock()) {
      const itemExistente = this.items.find(item => item.prenda.nombre === prenda.nombre);
      if (itemExistente) {
        itemExistente.cantidad++;
      } else {
        this.items.push({ prenda: prenda, cantidad: 1 });
      }
      prenda.stock--;
      this.guardarEnLocalStorage();
      mostrarCarrito();
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Sin stock',
        text: `No hay stock disponible de ${prenda.nombre}.`,
      });
    }
  }

  generarTotal() {
    return this.items.reduce((acc, item) => acc + item.prenda.precio * item.cantidad, 0);
  }

  guardarEnLocalStorage() {
    const carritoSimple = this.items.map(item => ({
      nombre: item.prenda.nombre,
      precio: item.prenda.precio,
      cantidad: item.cantidad
    }));
    localStorage.setItem("carrito", JSON.stringify(carritoSimple));
  }

  vaciar() {
    this.items = [];
    localStorage.removeItem("carrito");
  }
}

const CatalogoDePrendas = [
  new Prenda("Remera Blanca", 3500, 3),
  new Prenda("Pantalón Jeans", 7200, 2),
  new Prenda("Campera Negra", 9800, 1),
];

const carrito = new Carrito();

function mostrarCatalogo() {
  const catalogoDiv = document.getElementById("catalogo");
  catalogoDiv.innerHTML = "";

  CatalogoDePrendas.forEach((prenda) => {
    const div = document.createElement("div");
    div.className = "producto";

    const nombre = document.createElement("div");
    nombre.innerHTML = `<strong>${prenda.nombre}</strong> - $${prenda.precio} - Stock: ${prenda.stock}`;

    const boton = document.createElement("button");
    boton.textContent = "Agregar al carrito";

    if (!prenda.verificarStock()) {
      boton.textContent = "Sin stock";
      boton.style.backgroundColor = "#95a5a6";
      boton.disabled = true;
    }

    boton.addEventListener("click", () => {
      carrito.agregarPrenda(prenda);
      mostrarCarrito();

      boton.textContent = "Agregado!";
      boton.style.backgroundColor = "#2ecc71";

      setTimeout(() => {
        if (prenda.verificarStock()) {
          boton.textContent = "Agregar al carrito";
          boton.style.backgroundColor = "#3498db";
          boton.disabled = false;
        } else {
          boton.textContent = "Sin stock";
          boton.style.backgroundColor = "#95a5a6";
          boton.disabled = true;
        }
        mostrarCatalogo();
      }, 800);
    });

    div.appendChild(nombre);
    div.appendChild(boton);
    catalogoDiv.appendChild(div);
  });
}

function mostrarCarrito() {
  const carritoDiv = document.getElementById("carrito");
  carritoDiv.innerHTML = "";

  if (carrito.items.length === 0) {
    carritoDiv.innerText = "No agregaste productos al carrito.";
  } else {
    carrito.items.forEach(item => {
      const itemDiv = document.createElement("div");
      itemDiv.textContent = `${item.prenda.nombre} - $${item.prenda.precio} x ${item.cantidad} unidades`;
      carritoDiv.appendChild(itemDiv);
    });
  }

  const totalDiv = document.getElementById("total");
  totalDiv.innerHTML = `<strong>Total: $${carrito.generarTotal()}</strong>`;
}

function cargarCarritoDesdeLocalStorage() {
  const datos = localStorage.getItem("carrito");
  if (datos) {
    const itemsGuardados = JSON.parse(datos);
    itemsGuardados.forEach(data => {
      const prendaEnCatalogo = CatalogoDePrendas.find(p => p.nombre === data.nombre);
      if (prendaEnCatalogo) {
        const cantidadAAgregar = Math.min(data.cantidad, prendaEnCatalogo.stock);
        if (cantidadAAgregar > 0) {
          carrito.items.push({ prenda: prendaEnCatalogo, cantidad: cantidadAAgregar });
          prendaEnCatalogo.stock -= cantidadAAgregar;
        }
      }
    });
  }
}

function mostrarPantallaPrincipal() {
  const main = document.querySelector("main");
  main.innerHTML = `
    <section id="catalogo-section">
      <h2>Catálogo de Prendas</h2>
      <div id="catalogo"></div>
    </section>

    <aside id="carrito-sidebar">
      <h2>🛒 Carrito</h2>
      <div id="carrito"></div>
      <div id="total"></div>
      <button id="finalizar">Ver carrito</button>
      <button id="vaciar">Vaciar carrito</button>
    </aside>
  `;

  document.getElementById("finalizar").addEventListener("click", () => {
    if (carrito.items.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Carrito vacío',
        text: 'No hay productos para mostrar en el carrito.',
      });
    } else {
      mostrarPantallaCarritoConFormulario();
    }
  });

  document.getElementById("vaciar").addEventListener("click", () => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "Se vaciará todo el carrito.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, vaciar carrito',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        carrito.vaciar();
        CatalogoDePrendas.forEach(p => p.restaurarStock());
        mostrarCarrito();
        mostrarCatalogo();
        Swal.fire('¡Vacío!', 'Tu carrito está vacío.', 'success');
      }
    });
  });

  mostrarCatalogo();
  mostrarCarrito();
}

// Pantalla donde se finaliza la compra
function mostrarPantallaCarritoConFormulario() {
  const main = document.querySelector("main");
  main.innerHTML = `
    <section id="carrito-formulario" style="display:flex; gap:20px; padding:20px; max-width:1200px; margin:auto;">
      <div id="carrito-formulario-productos" style="flex:1; background:#fff; border:1px solid #ccc; border-radius:6px; padding:20px;">
        <h2>🛒 Tu carrito</h2>
        <div id="carrito-productos" style="margin-bottom:20px; border:1px solid #ccc; padding:10px; border-radius:6px;"></div>
        <div id="total" style="font-weight:bold; margin-bottom:20px;"></div>
      </div>

      <div id="carrito-formulario-envio" style="flex:2; background:#fff; border:1px solid #ccc; border-radius:6px; padding:20px;">
        <h3>Completa tus datos de envío</h3>
        <form id="form-envio">
          <label>Nombre:<br><input type="text" id="nombre" required style="width:100%; padding:8px;"></label><br><br>
          <label>Apellido:<br><input type="text" id="apellido" required style="width:100%; padding:8px;"></label><br><br>
          <label>Email:<br><input type="email" id="email" required style="width:100%; padding:8px;"></label><br><br>
          <label>C.P:<br><input type="text" id="cp" required style="width:100%; padding:8px;"></label><br><br>
          <label>Dirección:<br><input type="text" id="direccion" required style="width:100%; padding:8px;"></label><br><br>
          <button type="submit" style="padding:10px 15px; background:#008000; color:white; border:none; border-radius:5px; cursor:pointer;">Finalizar compra</button>
        </form>

        <button id="volver" style="margin-top:15px; padding:10px 15px; background:#ccc; color:#333; border:none; border-radius:5px; cursor:pointer;">Volver al catálogo</button>
      </div>
    </section>
  `;

  // Precarga de datos en los campos del formulario
  document.getElementById("nombre").value = "Matias";
  document.getElementById("apellido").value = "Torres";
  document.getElementById("email").value = "m.torres@gmail.com";
  document.getElementById("cp").value = "7600";
  document.getElementById("direccion").value = "Calle costa 4879";

  const productosDiv = document.getElementById("carrito-productos");
  if (carrito.items.length === 0) {
    productosDiv.textContent = "No hay productos en el carrito.";
  } else {
    carrito.items.forEach(item => {
      const itemDiv = document.createElement("div");
      itemDiv.textContent = `${item.prenda.nombre} - $${item.prenda.precio} x ${item.cantidad} unidades`;
      productosDiv.appendChild(itemDiv);
    });
  }

  document.getElementById("total").textContent = `Total: $${carrito.generarTotal()}`;

  const formEnvio = document.getElementById("form-envio");
  formEnvio.addEventListener("submit", (e) => {
    e.preventDefault();

    if (carrito.items.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Carrito vacío',
        text: 'No hay productos para comprar.',
      });
      return;
    }

    // Numero de transaccion aleatoria
    const numeroTransaccion = Math.floor(Math.random() * 1000000);
    const totalCompra = carrito.generarTotal();

    Swal.fire({
      title: 'Gracias por su compra',
      html: `<p>Su número de transacción es: <strong>#${numeroTransaccion}</strong></p>
             <p>Total pagado: <strong>$${totalCompra}</strong></p>`,
      icon: 'success',
      confirmButtonText: 'Aceptar'
    }).then(() => {
      carrito.vaciar();
      CatalogoDePrendas.forEach(p => p.restaurarStock());
      mostrarPantallaPrincipal();
    });
  });

  document.getElementById("volver").addEventListener("click", () => {
    mostrarPantallaPrincipal();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  cargarCarritoDesdeLocalStorage();
  mostrarPantallaPrincipal();
});
