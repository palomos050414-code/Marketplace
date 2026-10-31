(() => {
  const $ = (s) => document.querySelector(s);
  const money = new Intl.NumberFormat("es-CO", {style:"currency", currency:"COP", maximumFractionDigits:0});
  const nd = (v) => v ?? "No disponible";
  const cart = new Map(); // id -> cantidad
  let current = null;

  // Imagen de respaldo si el archivo no existe en /img
  const placeholder = (p) => "data:image/svg+xml;utf8," + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480"><rect width="100%" height="100%" fill="#dfe6e3"/>` +
    `<text x="50%" y="48%" text-anchor="middle" font-family="sans-serif" font-size="34" font-weight="700" fill="#12343b">${p.marca}</text>` +
    `<text x="50%" y="60%" text-anchor="middle" font-family="sans-serif" font-size="26" fill="#51666b">${p.nombre}</text></svg>`);
  const setImg = (img, p) => { img.onerror = () => { img.onerror = null; img.src = placeholder(p); }; img.src = p.imagen; img.alt = `${p.marca} ${p.nombre}`; };

  // Filtros
  [...new Set(PRODUCTS.map(p => p.marca))].sort().forEach(m => $("#brand").add(new Option(m, m)));

  function visibles() {
    const q = $("#search").value.trim().toLowerCase(), b = $("#brand").value, s = $("#sort").value;
    let list = PRODUCTS.filter(p => (!b || p.marca === b) && `${p.marca} ${p.nombre}`.toLowerCase().includes(q));
    if (s) list = [...list].sort((x, y) => s === "asc" ? x.precio - y.precio : y.precio - x.precio);
    return list;
  }

  function renderGrid() {
    const list = visibles(), grid = $("#grid");
    grid.innerHTML = "";
    $("#empty").hidden = list.length > 0;
    list.forEach(p => {
      const el = document.createElement("article");
      el.className = "card";
      el.innerHTML = `<img loading="lazy" width="640" height="480" alt="">
        <div class="card-body">
          <span class="brand">${p.marca} · ${p.categoria}</span>
          <h3>${p.nombre}</h3>
          <p class="price">${money.format(p.precio)}</p>
          <div class="card-actions">
            <button class="btn alt" data-detail="${p.id}">Ver ficha técnica</button>
            <button class="btn" data-add="${p.id}">Agregar al carrito</button>
          </div></div>`;
      setImg(el.querySelector("img"), p);
      grid.append(el);
    });
  }

  // Modal de ficha técnica
  function openDetail(id) {
    const p = PRODUCTS.find(x => x.id === id); current = p;
    setImg($("#mImg"), p);
    $("#mTitle").textContent = `${p.marca} ${p.nombre}`;
    $("#mDesc").textContent = p.descripcion;
    $("#mPrice").textContent = money.format(p.precio);
    const rows = [["Cilindraje", p.cilindraje], ["Potencia", p.potencia], ["Torque", p.torque], ["Transmisión", p.transmision],
                  ["Frenos", p.frenos], ["Peso", p.peso], ["Tanque", p.tanque]];
    $("#mSpecs").innerHTML = rows.map(([k, v]) => `<dt>${k}</dt><dd>${nd(v)}</dd>`).join("");
    $("#modal").showModal();
  }

  // Carrito
  function renderCart() {
    let total = 0, count = 0;
    $("#cartList").innerHTML = [...cart].map(([id, qty]) => {
      const p = PRODUCTS.find(x => x.id === id); total += p.precio * qty; count += qty;
      return `<li><div><strong>${p.marca} ${p.nombre}</strong><br>${money.format(p.precio * qty)}</div>
        <div class="qty"><button data-dec="${id}" aria-label="Quitar una unidad">−</button><span>${qty}</span>
        <button data-inc="${id}" aria-label="Agregar una unidad">+</button></div>
        <button class="remove" data-del="${id}">Eliminar</button></li>`;
    }).join("");
    $("#cartCount").textContent = count;
    $("#cartTotal").textContent = money.format(total);
    $("#cartEmpty").hidden = count > 0;
    $("#checkout").disabled = count === 0;
  }
  const add = (id, n = 1) => { const q = (cart.get(id) || 0) + n; q > 0 ? cart.set(id, q) : cart.delete(id); renderCart(); };

  // Eventos
  document.addEventListener("click", (e) => {
    const t = e.target.closest("button"); if (!t) return;
    const d = t.dataset;
    if (d.detail) openDetail(+d.detail);
    if (d.add) { add(+d.add); $("#drawer").hidden = false; }
    if (d.inc) add(+d.inc);
    if (d.dec) add(+d.dec, -1);
    if (d.del) { cart.delete(+d.del); renderCart(); }
    if ("close" in d) $("#modal").close();
    if ("drawerClose" in d) $("#drawer").hidden = true;
  });
  $("#mAdd").onclick = () => { add(current.id); $("#modal").close(); $("#drawer").hidden = false; };
  $("#cartBtn").onclick = () => { $("#drawer").hidden = !$("#drawer").hidden; };
  $("#checkout").onclick = () => { alert("¡Pedido recibido! Total: " + $("#cartTotal").textContent); cart.clear(); renderCart(); $("#drawer").hidden = true; };
  $("#menuBtn").onclick = () => { const o = $("#nav").classList.toggle("open"); $("#menuBtn").setAttribute("aria-expanded", o); };
  $("#nav").onclick = () => $("#nav").classList.remove("open");
  $("#modal").addEventListener("click", (e) => { if (e.target === $("#modal")) $("#modal").close(); });
  ["#search", "#brand", "#sort"].forEach(s => $(s).addEventListener("input", renderGrid));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") $("#drawer").hidden = true; });

  renderGrid(); renderCart();
})();