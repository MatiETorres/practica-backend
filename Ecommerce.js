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
    this.prendas = [];
  }

  agregarPrenda(prenda) {
    if (prenda.verificarStock()) {
      this.prendas.push(prenda);
      prenda.stock--;
      this.guardarEnLocalStorage();
      mostrarCarrito();
    } else {
      alert(`No hay stock disponible de ${prenda.nombre}.`);
    }
  }

  generarTotal() {
    return this.prendas.reduce((acc, prenda) => acc + prenda.precio, 0);
  }

  guardarEnLocalStorage() {
    const carritoSimple = this.prendas.map(p => ({
      nombre: p.nombre,
      precio: p.precio
    }));
    localStorage.setItem("carrito", JSON.stringify(carritoSimple));
  }

  vaciar() {
    this.prendas = [];
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
    div.style.marginBottom = "20px";
    div.style.padding = "10px";
    div.style.border = "1px solid #ccc";
    div.style.borderRadius = "6px";
    div.style.boxShadow = "2px 2px 5px rgba(0,0,0,0.05)";
    div.style.display = "flex";
    div.style.justifyContent = "space-between";
    div.style.alignItems = "center";

    const nombre = document.createElement("div");
    nombre.innerHTML = `<strong>${prenda.nombre}</strong> - $${prenda.precio} - Stock: ${prenda.stock}`;

    const boton = document.createElement("button");
    boton.textContent = "Agregar al carrito";
    boton.style.backgroundColor = "#3498db";
    boton.style.color = "white";
    boton.style.border = "none";
    boton.style.padding = "8px 12px";
    boton.style.borderRadius = "4px";
    boton.style.cursor = "pointer";
    boton.style.transition = "background-color 0.3s";

    // Si no hay stock queda dashabilitado
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

  if (carrito.prendas.length === 0) {
    carritoDiv.innerText = "No agregaste productos al carrito.";
  } else {
    carrito.prendas.forEach(prenda => {
      const item = document.createElement("div");
      item.textContent = `${prenda.nombre} - $${prenda.precio}`;
      carritoDiv.appendChild(item);
    });
  }

  const totalDiv = document.getElementById("total");
  totalDiv.innerHTML = `<strong>Total: $${carrito.generarTotal()}</strong>`;
}

function cargarCarritoDesdeLocalStorage() {
  const datos = localStorage.getItem("carrito");
  if (datos) {
    const prendasGuardadas = JSON.parse(datos);
    prendasGuardadas.forEach(data => {
      const prendaEnCatalogo = CatalogoDePrendas.find(p => p.nombre === data.nombre);
      if (prendaEnCatalogo && prendaEnCatalogo.verificarStock()) {
        carrito.prendas.push(prendaEnCatalogo);
        prendaEnCatalogo.stock--;
      }
    });
  }
}

// Botón Finalizar compra
const finalizarBtn = document.getElementById("finalizar");
finalizarBtn.style.backgroundColor = "#008000";
finalizarBtn.style.color = "white";
finalizarBtn.style.border = "none";
finalizarBtn.style.padding = "10px 15px";
finalizarBtn.style.borderRadius = "5px";
finalizarBtn.style.margin = "10px 10px 30px 0";
finalizarBtn.style.cursor = "pointer";

finalizarBtn.addEventListener("click", () => {
  alert("Gracias por tu compra. Total: $" + carrito.generarTotal());
  carrito.vaciar();
  CatalogoDePrendas.forEach(p => p.restaurarStock());
  location.reload();
});

// Botón Vaciar carrito
const vaciarBtn = document.getElementById("vaciar");
vaciarBtn.style.backgroundColor = "#c0392b";
vaciarBtn.style.color = "white";
vaciarBtn.style.border = "none";
vaciarBtn.style.padding = "10px 15px";
vaciarBtn.style.borderRadius = "5px";
vaciarBtn.style.margin = "10px 0 30px 0";
vaciarBtn.style.cursor = "pointer";

vaciarBtn.addEventListener("click", () => {
  if (confirm("¿Estás seguro de que querés vaciar el carrito?")) {
    carrito.vaciar();
    CatalogoDePrendas.forEach(p => p.restaurarStock());
    mostrarCarrito();
    mostrarCatalogo();
  }
});


cargarCarritoDesdeLocalStorage();
mostrarCatalogo();
mostrarCarrito();
