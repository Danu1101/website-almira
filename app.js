(function () {
  'use strict';

  var data = null;
  var cart = {};          // { indexProduk: jumlah }

  var $ = function (id) { return document.getElementById(id); };

  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'class') n.className = attrs[k];
      else if (k === 'text') n.textContent = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }

  function rupiah(n) { return 'Rp ' + Number(n || 0).toLocaleString('id-ID'); }
  function waLink(text) { return 'https://wa.me/' + data.whatsapp + '?text=' + encodeURIComponent(text); }
  function setLink(id, url) {
    var a = $(id);
    if (url) a.href = url; else a.hidden = true;
  }

  /* ---------- Render ---------- */
  function renderProfil() {
    document.title = data.nama + ' – Oleh-oleh Khas Malang';
    $('nama').textContent = data.nama;
    $('nama-footer').textContent = data.nama;
    $('tagline').textContent = data.tagline || '';
    $('tahun').textContent = new Date().getFullYear();
    if (data.logo) $('logo').src = data.logo;

    var box = $('keunggulan');
    box.textContent = '';
    (data.keunggulan || []).forEach(function (k) {
      box.appendChild(el('div', { class: 'fact' }, [
        el('strong', { text: k.judul }),
        el('span', { text: k.keterangan })
      ]));
    });
    box.hidden = !(data.keunggulan && data.keunggulan.length);

    $('alamat').textContent = data.alamat || '';
    $('jam').textContent = data.jam || '';

    $('wa-utama').href = waLink('Halo ' + data.nama + ', saya tertarik memesan keripik tempe. Boleh info stok rasa yang tersedia?');
    $('wa-custom').href = waLink('Halo ' + data.nama + ', saya ingin tanya pesanan custom / kiloan. Rasa dan jumlah yang saya butuhkan: ');
    setLink('link-maps', data.maps);
    setLink('link-ig', data.instagram);
    setLink('link-tiktok', data.tiktok);
    setLink('link-fb', data.facebook);
  }

  function renderTestimoni() {
    var box = $('testimoni');
    var list = data.testimoni || [];
    box.textContent = '';
    if (!list.length) { box.hidden = true; return; }
    box.hidden = false;
    list.forEach(function (t, i) {
      var item = el('div', i ? { style: 'margin-top:12px' } : {}, [
        el('p', { text: '“' + t.isi + '”' }),
        el('cite', { text: '— ' + t.nama })
      ]);
      box.appendChild(item);
    });
  }

  function renderProduk() {
    var box = $('daftar-produk');
    box.textContent = '';
    (data.produk || []).forEach(function (p, i) {
      var title = el('h3', { text: p.nama });
      if (p.label) title.appendChild(el('span', { class: 'badge', text: p.label }));

      var img = el('img', { src: p.foto || data.logo || '/images/logo.jpg', alt: p.nama, loading: 'lazy' });
      var info = el('div', { class: 'info' }, [
        title,
        p.deskripsi ? el('p', { text: p.deskripsi }) : null,
        el('div', { class: 'harga', text: rupiah(p.harga) })
      ]);

      var minus = el('button', { type: 'button', 'aria-label': 'Kurangi ' + p.nama, text: '−' });
      var plus = el('button', { type: 'button', class: 'plus', 'aria-label': 'Tambah ' + p.nama, text: '+' });
      var count = el('span', { text: String(cart[i] || 0), 'aria-live': 'polite' });
      minus.addEventListener('click', function () { ubahJumlah(i, -1); });
      plus.addEventListener('click', function () { ubahJumlah(i, 1); });

      box.appendChild(el('div', { class: 'product' }, [
        img, info, el('div', { class: 'qty' }, [minus, count, plus])
      ]));
    });
  }

  /* ---------- Keranjang ---------- */
  function ubahJumlah(i, delta) {
    cart[i] = (cart[i] || 0) + delta;
    if (cart[i] <= 0) delete cart[i];
    renderProduk();
    renderCheckout();
  }

  function renderCheckout() {
    var qty = 0, total = 0;
    (data.produk || []).forEach(function (p, i) {
      var q = cart[i] || 0;
      qty += q; total += q * p.harga;
    });
    $('checkout').hidden = qty === 0;
    $('jumlah').textContent = qty;
    $('total').textContent = rupiah(total);
  }

  function kirimWA() {
    var nama = $('nama-pemesan').value.trim() || 'Pelanggan';
    var alamat = $('alamat-pemesan').value.trim() || '-';
    var kirim = $('pengiriman').value;
    var baris = '', total = 0;

    (data.produk || []).forEach(function (p, i) {
      var q = cart[i] || 0;
      if (!q) return;
      total += q * p.harga;
      baris += '• ' + p.nama + ' x' + q + ' = ' + rupiah(q * p.harga) + '\n';
    });

    var pesan =
      'Halo *' + data.nama + '*, saya mau pesan:\n\n' +
      '*Detail pesanan:*\n' + baris + '\n' +
      '*Total produk:* ' + rupiah(total) + '\n\n' +
      '*Data pemesan:*\nNama: ' + nama + '\nAlamat: ' + alamat + '\nPengiriman: ' + kirim + '\n\n' +
      'Mohon info total beserta ongkirnya ya. Terima kasih!';

    window.open(waLink(pesan), '_blank', 'noopener');
  }

  /* ---------- Tab ---------- */
  function pilihTab(nama) {
    var katalog = nama === 'katalog';
    $('panel-tautan').hidden = katalog;
    $('panel-katalog').hidden = !katalog;
    $('tab-tautan').classList.toggle('is-active', !katalog);
    $('tab-katalog').classList.toggle('is-active', katalog);
    $('tab-tautan').setAttribute('aria-selected', String(!katalog));
    $('tab-katalog').setAttribute('aria-selected', String(katalog));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function bagikan() {
    var url = location.href;
    if (navigator.share) {
      navigator.share({ title: data.nama, text: data.tagline, url: url }).catch(function () {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(function () { alert('Link website berhasil disalin.'); });
    }
  }

  /* ---------- Mulai ---------- */
  function tampilkanGalat(msg) {
    var g = $('galat');
    g.textContent = msg;
    g.hidden = false;
  }

  $('tab-tautan').addEventListener('click', function () { pilihTab('tautan'); });
  $('tab-katalog').addEventListener('click', function () { pilihTab('katalog'); });
  $('buka-katalog').addEventListener('click', function () { pilihTab('katalog'); });
  $('kirim-wa').addEventListener('click', kirimWA);
  $('bagikan').addEventListener('click', bagikan);

  fetch('/content/site.json', { cache: 'no-cache' })
    .then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(function (json) {
      data = json;
      renderProfil();
      renderTestimoni();
      renderProduk();
      renderCheckout();
    })
    .catch(function () {
      tampilkanGalat('Data website gagal dimuat. Buka lewat Live Server atau situs Netlify, jangan klik dua kali file index.html.');
    });
})();
