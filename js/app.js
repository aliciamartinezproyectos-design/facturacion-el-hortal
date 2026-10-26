'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],KEY='frutasElHortalDBv3';
const el={cliente:$('#cliente'),numero:$('#numero'),nif:$('#nif'),fecha:$('#fecha'),direccion:$('#direccion'),vencimiento:$('#vencimiento'),telefono:$('#telefono'),pago:$('#pago'),correo:$('#correo'),iva:$('#iva'),lineas:$('#lineas'),observaciones:$('#observaciones'),subtotal:$('#subtotal'),descuento:$('#descuentoTotal'),base:$('#base'),ivaLabel:$('#ivaLabel'),ivaTotal:$('#ivaTotal'),total:$('#total'),toast:$('#toast')};
let db=load(),editingId=null;
function clone(x){return JSON.parse(JSON.stringify(x))}
function migrate(x){x.productos=(x.productos||[]).map(p=>({...p,precioKg:p.precioKg??p.precio??null,precioUnidad:p.precioUnidad??null}));return x}
function load(){try{return migrate(JSON.parse(localStorage.getItem(KEY))||clone(SEED))}catch{return clone(SEED)}}
function persist(){localStorage.setItem(KEY,JSON.stringify(db));renderAll()}
function nextId(a){return a.length?Math.max(...a.map(x=>+x.id||0))+1:1}
function money(n){return new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'}).format(+n||0)}
function num(v){return +(String(v??'').replace(',','.'))||0}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function toast(t){el.toast.textContent=t;el.toast.style.display='block';setTimeout(()=>el.toast.style.display='none',2500)}
function today(){return new Date().toISOString().slice(0,10)}
function showView(name){$$('.view').forEach(x=>x.classList.toggle('active',x.id===name));scrollTo(0,0)}
document.addEventListener('click',e=>{const b=e.target.closest('[data-view]');if(b)showView(b.dataset.view)});
function nextInvoice(){const ns=db.facturas.map(f=>+(String(f.numero).match(/FO-(\d+)/i)||[])[1]||0);return `FO-${Math.max(0,...ns)+1}`}
function productOptions(value=''){return '<option value="">Selecciona</option>'+db.productos.map(x=>`<option value="${x.id}" ${String(x.id)===String(value)?'selected':''}>${esc(x.nombre)}</option>`).join('')}
function fillMasterSelects(){const cv=el.cliente.value,iv=el.iva.value;el.cliente.innerHTML='<option value="">Selecciona un cliente</option>'+db.clientes.map(x=>`<option value="${x.id}">${esc(x.nombre)}</option>`).join('');el.cliente.value=cv;el.iva.innerHTML=db.ivas.map(x=>`<option value="${x.id}">${esc(x.nombre)} (${x.valor*100}%)</option>`).join('');el.iva.value=iv||String(db.ivas.find(x=>x.nombre==='IVA general')?.id||db.ivas[0]?.id||'');$$('.product-select').forEach(s=>{const v=s.value;s.innerHTML=productOptions(v)})}
function clientData(){const c=db.clientes.find(x=>x.id==el.cliente.value)||{};el.nif.value=c.nif||'';el.direccion.value=c.direccion||'';el.telefono.value=c.telefono||'';el.correo.value=c.correo||''}
el.cliente.addEventListener('change',clientData);
function setQuantityMode(tr,mode){const kg=tr.querySelector('.qty-kg'),units=tr.querySelector('.qty-units');kg.disabled=mode!=='kg';units.disabled=mode!=='unidad';if(mode==='kg')units.value='';else kg.value='';calc()}
function addLine(data={}){const tr=document.createElement('tr');const mode=data.tipo||'kg';tr.innerHTML=`<td><select class="product-select">${productOptions(data.productoId)}</select></td><td><select class="type-select"><option value="kg" ${mode==='kg'?'selected':''}>kg</option><option value="unidad" ${mode==='unidad'?'selected':''}>unidad</option></select></td><td class="catalog-price">0,00 €</td><td><input class="edited-price" type="number" min="0" step="0.01" value="${data.precioEditado??''}"></td><td class="applied-price">0,00 €</td><td><input class="qty-kg" type="number" min="0" step="0.01" value="${data.cantidadKg??(mode==='kg'?(data.cantidad??''):'')}"></td><td><input class="qty-units" type="number" min="0" step="1" value="${data.cantidadUnidades??(mode==='unidad'?(data.cantidad??''):'')}"></td><td><input class="discount" type="number" min="0" max="100" step="0.01" value="${data.descuento??0}"></td><td class="line-total">0,00 €</td><td class="no-print"><button type="button" class="danger delete-line">×</button></td>`;el.lineas.append(tr);tr.querySelector('.type-select').addEventListener('change',e=>setQuantityMode(tr,e.target.value));tr.querySelector('.delete-line').addEventListener('click',()=>{tr.remove();calc()});tr.addEventListener('input',calc);tr.addEventListener('change',calc);setQuantityMode(tr,mode);return tr}
function calc(){let sub=0,discount=0;$$('#lineas tr').forEach(tr=>{const p=db.productos.find(x=>x.id==tr.querySelector('.product-select').value),mode=tr.querySelector('.type-select').value,catalog=mode==='kg'?p?.precioKg:p?.precioUnidad,edited=tr.querySelector('.edited-price').value,applied=edited!==''?num(edited):num(catalog),qty=mode==='kg'?num(tr.querySelector('.qty-kg').value):num(tr.querySelector('.qty-units').value),d=num(tr.querySelector('.discount').value),gross=applied*qty,net=gross*(1-d/100);sub+=gross;discount+=gross-net;tr.querySelector('.catalog-price').textContent=catalog==null?'Sin precio':money(catalog);tr.querySelector('.applied-price').textContent=money(applied);tr.querySelector('.line-total').textContent=money(net)});const base=sub-discount,r=db.ivas.find(x=>x.id==el.iva.value),tax=base*(r?.valor||0);el.subtotal.textContent=money(sub);el.descuento.textContent=money(discount);el.base.textContent=money(base);el.ivaLabel.textContent=r?`${r.nombre} (${r.valor*100}%)`:'IVA';el.ivaTotal.textContent=money(tax);el.total.textContent=money(base+tax);return{sub,discount,base,tax,total:base+tax}}
el.iva.addEventListener('change',calc);
$('#addLine').addEventListener('click',()=>addLine());
const dialog=$('#productDialog'),quickForm=$('#quickProductForm');
$('#quickProduct').addEventListener('click',()=>{quickForm.reset();dialog.showModal()});
$('#cancelProduct').addEventListener('click',()=>dialog.close());
quickForm.addEventListener('submit',e=>{e.preventDefault();const x=Object.fromEntries(new FormData(quickForm)),kg=x.precioKg===''?null:num(x.precioKg),unit=x.precioUnidad===''?null:num(x.precioUnidad);if(kg==null&&unit==null)return toast('Introduce un precio por kg o por unidad.');const p={id:nextId(db.productos),nombre:x.nombre.trim(),precioKg:kg,precioUnidad:unit};db.productos.push(p);persist();const tr=addLine({productoId:p.id,tipo:kg!=null?'kg':'unidad'});tr.querySelector('.product-select').value=String(p.id);calc();dialog.close();toast('Producto creado y añadido a la factura.')});
function getInvoice(){const c=db.clientes.find(x=>x.id==el.cliente.value),r=db.ivas.find(x=>x.id==el.iva.value),lines=$$('#lineas tr').map((tr,i)=>{const p=db.productos.find(x=>x.id==tr.querySelector('.product-select').value),tipo=tr.querySelector('.type-select').value,catalog=tipo==='kg'?p?.precioKg:p?.precioUnidad,pe=tr.querySelector('.edited-price').value,pa=pe!==''?num(pe):num(catalog),kg=tipo==='kg'?num(tr.querySelector('.qty-kg').value):0,units=tipo==='unidad'?num(tr.querySelector('.qty-units').value):0,q=tipo==='kg'?kg:units,d=num(tr.querySelector('.discount').value);return{i:i+1,productoId:p?.id,producto:p?.nombre||'',tipo,precioCatalogo:num(catalog),precioEditado:pe===''?null:num(pe),precioAplicado:pa,cantidadKg:kg,cantidadUnidades:units,cantidad:q,descuento:d,total:pa*q*(1-d/100)}}).filter(x=>x.productoId&&x.cantidad>0),t=calc();return{id:editingId||Date.now(),numero:el.numero.value.trim(),clienteId:c?.id,cliente:c?.nombre||'',nif:el.nif.value,direccion:el.direccion.value,telefono:el.telefono.value,correo:el.correo.value,fecha:el.fecha.value,vencimiento:el.vencimiento.value,pago:el.pago.value,ivaId:r?.id,ivaNombre:r?.nombre||'',ivaValor:r?.valor||0,observaciones:el.observaciones.value,lineas:lines,subtotal:t.sub,descuento:t.discount,base:t.base,iva:t.tax,total:t.total}}
function clearInvoice(){editingId=null;el.numero.value=nextInvoice();el.fecha.value=el.vencimiento.value=today();el.cliente.value='';clientData();el.pago.value='Transferencia bancaria';el.observaciones.value='';el.lineas.innerHTML='';addLine();calc()}
$('#newInvoice').addEventListener('click',clearInvoice);
$('#saveInvoice').addEventListener('click',()=>{const f=getInvoice();if(!f.clienteId)return toast('Selecciona un cliente.');if(!f.numero)return toast('Indica el número de factura.');if(!f.lineas.length)return toast('Añade al menos un producto con cantidad.');const pos=db.facturas.findIndex(x=>x.id===f.id);pos>=0?db.facturas[pos]=f:db.facturas.push(f);editingId=f.id;persist();toast(`Factura ${f.numero} guardada.`)});

/* Impresión robusta: abre una ventana que contiene exclusivamente la factura. */
$('#printInvoice').addEventListener('click',()=>{
    const f=getInvoice();
    if(!f.clienteId||!f.lineas.length)return toast('Completa cliente y productos antes de generar el PDF.');
    const factura=document.getElementById('invoicePaper');
    if(!factura)return toast('No se ha encontrado la plantilla de factura.');
    const ventana=window.open('','_blank');
    if(!ventana)return toast('El navegador ha bloqueado la ventana de impresión.');
    const estilos=`
        @page{size:A4 portrait;margin:10mm}
        *{box-sizing:border-box}
        html,body{margin:0;padding:0;background:#fff;color:#25332d;font-family:Arial,sans-serif}
        body{width:100%}
        .paper{width:190mm;max-width:190mm;margin:0 auto;padding:0;background:#fff}
        .invoice-brand{display:grid;grid-template-columns:20mm minmax(0,1fr) 55mm;gap:4mm;align-items:center;border-bottom:3px solid #1e654b;padding-bottom:4mm}
        .invoice-brand img{display:block;width:18mm;height:18mm;max-width:18mm;max-height:18mm;object-fit:contain}
        .invoice-brand h2{margin:0;font-size:15px;line-height:1.2}
        .invoice-brand p{margin:0;font-size:9px;line-height:1.3}
        .invoice-brand h1{margin:0;color:#1e654b;font-size:17px;line-height:1.2;text-align:right}
        .form-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);column-gap:15mm;row-gap:2mm;margin:6mm 0;width:100%}
        .form-grid label{display:block;min-width:0;font-size:9px;font-weight:700}
        .form-grid input,.form-grid select{display:block;width:100%;min-width:0;border:0;border-radius:0;padding:1mm 0;margin:0;background:transparent;color:#000;font:700 10px/1.15 Arial,sans-serif;appearance:none;-webkit-appearance:none}
        .table-wrap{display:block;width:100%;overflow:visible}
        table{width:100%;border-collapse:collapse;table-layout:auto}
        th{background:#1e654b;color:#fff;font-size:7px;padding:1.5mm .8mm;white-space:normal}
        td{border-bottom:1px solid #d5dfd9;font-size:7px;padding:1.5mm .8mm;vertical-align:top}
        td input,td select{display:block;width:100%;min-width:0;border:0;padding:0;margin:0;background:transparent;color:#000;font-size:7px;appearance:none;-webkit-appearance:none}
        .invoice-bottom{display:grid;grid-template-columns:minmax(0,1fr) 70mm;gap:8mm;margin-top:5mm;width:100%;break-inside:avoid}
        .invoice-bottom textarea{display:block;width:100%;height:25mm;border:0;padding:1mm;resize:none;overflow:hidden;background:transparent;color:#000}
        .totals p{display:flex;justify-content:space-between;margin:0;padding:2mm;border-bottom:1px solid #ddd;font-size:9px}
        .totals .grand{background:#eee;color:#000;font-weight:700}
        .signatures{display:flex;justify-content:space-between;margin-top:8mm;padding-top:2mm;border-top:1px solid #777;font-size:8px;break-inside:avoid}
        .no-print,button{display:none!important}
    `;
    ventana.document.open();
    ventana.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(f.numero||'factura')}</title><style>${estilos}</style></head><body>${factura.outerHTML}</body></html>`);
    ventana.document.close();
    const imprimir=()=>setTimeout(()=>{ventana.focus();ventana.print()},350);
    if(ventana.document.readyState==='complete')imprimir();else ventana.addEventListener('load',imprimir,{once:true});
});

window.removeRecord=(type,i)=>{if(confirm('¿Eliminar este registro?')){db[type]=db[type].filter(x=>x.id!=i);persist();toast('Registro eliminado.')}};
window.editInvoice=i=>{const f=db.facturas.find(x=>x.id==i);if(!f)return;editingId=f.id;el.numero.value=f.numero;el.fecha.value=f.fecha;el.vencimiento.value=f.vencimiento;el.cliente.value=f.clienteId;clientData();el.pago.value=f.pago;el.iva.value=f.ivaId;el.observaciones.value=f.observaciones||'';el.lineas.innerHTML='';f.lineas.forEach(addLine);calc();showView('factura')};
$('#clienteForm').addEventListener('submit',e=>{e.preventDefault();const x=Object.fromEntries(new FormData(e.target));db.clientes.push({id:nextId(db.clientes),...x});e.target.reset();persist();toast('Cliente guardado.')});
$('#productoForm').addEventListener('submit',e=>{e.preventDefault();const x=Object.fromEntries(new FormData(e.target)),kg=x.precioKg===''?null:num(x.precioKg),unit=x.precioUnidad===''?null:num(x.precioUnidad);if(kg==null&&unit==null)return toast('Introduce un precio por kg o por unidad.');db.productos.push({id:nextId(db.productos),nombre:x.nombre.trim(),precioKg:kg,precioUnidad:unit});e.target.reset();persist();toast('Producto guardado.')});
$('#ivaForm').addEventListener('submit',e=>{e.preventDefault();const x=Object.fromEntries(new FormData(e.target));db.ivas.push({id:nextId(db.ivas),nombre:x.nombre,valor:num(x.valor)/100});e.target.reset();persist();toast('IVA guardado.')});
function grid(headers,rows){return `<div class="table-wrap"><table><thead><tr>${headers.map(x=>`<th>${x}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`}
function renderAll(){fillMasterSelects();$('#clientesTable').innerHTML=grid(['Nombre','NIF/CIF','Dirección','Teléfono','Correo',''],db.clientes.map(x=>`<tr><td>${esc(x.nombre)}</td><td>${esc(x.nif)}</td><td>${esc(x.direccion)}</td><td>${esc(x.telefono)}</td><td>${esc(x.correo)}</td><td><button class="danger" onclick="removeRecord('clientes',${x.id})">Eliminar</button></td></tr>`));$('#productosTable').innerHTML=grid(['Producto','Precio/kg','Precio/unidad',''],db.productos.map(x=>`<tr><td>${esc(x.nombre)}</td><td>${x.precioKg==null?'':money(x.precioKg)}</td><td>${x.precioUnidad==null?'':money(x.precioUnidad)}</td><td><button class="danger" onclick="removeRecord('productos',${x.id})">Eliminar</button></td></tr>`));$('#ivasTable').innerHTML=grid(['Nombre','Valor',''],db.ivas.map(x=>`<tr><td>${esc(x.nombre)}</td><td>${x.valor*100}%</td><td><button class="danger" onclick="removeRecord('ivas',${x.id})">Eliminar</button></td></tr>`));$('#facturasTable').innerHTML=grid(['N.º','Cliente','Fecha','Base','IVA','Total',''],db.facturas.map(x=>`<tr><td>${esc(x.numero)}</td><td>${esc(x.cliente)}</td><td>${esc(x.fecha)}</td><td>${money(x.base)}</td><td>${money(x.iva)}</td><td>${money(x.total)}</td><td><button onclick="editInvoice(${x.id})">Abrir</button> <button class="danger" onclick="removeRecord('facturas',${x.id})">Eliminar</button></td></tr>`))}
function csvCell(v){return `"${String(v??'').replaceAll('"','""')}"`}
function download(name,text,type='text/csv;charset=utf-8'){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\ufeff'+text],{type}));a.download=name;a.click();URL.revokeObjectURL(a.href)}
function makeCsv(type){let h=[],r=[];if(type==='clientes'){h=['Nombre','NIF/CIF','Dirección de facturación','Teléfono','Correo'];r=db.clientes.map(x=>[x.nombre,x.nif,x.direccion,x.telefono,x.correo])}if(type==='productos'){h=['Producto','Precio/kg (€)','Precio/unidad (€)'];r=db.productos.map(x=>[x.nombre,x.precioKg,x.precioUnidad])}if(type==='ivas'){h=['Nombre','Valor','Descripción'];r=db.ivas.map(x=>[x.nombre,x.valor,`${x.nombre} (${x.valor*100}%)`])}if(type==='facturas'){h=['Cliente','Factura No.','Fecha de creación','Fecha de vencimiento','Forma de pago','Subtotal','Descuento','Base imponible','IVA','Total'];r=db.facturas.map(x=>[x.cliente,x.numero,x.fecha,x.vencimiento,x.pago,x.subtotal,x.descuento,x.base,x.iva,x.total])}if(type==='detalles'){h=['Factura No.','Línea','Producto','Tipo','Precio catálogo','Precio editado','Precio aplicado','Cantidad kg','Cantidad unidades','Descuento','Total sin IVA'];r=db.facturas.flatMap(f=>f.lineas.map(x=>[f.numero,x.i,x.producto,x.tipo,x.precioCatalogo,x.precioEditado,x.precioAplicado,x.cantidadKg,x.cantidadUnidades,x.descuento,x.total]))}download(`${type}.csv`,[h,...r].map(row=>row.map(csvCell).join(';')).join('\r\n'))}
$$('[data-export]').forEach(b=>b.addEventListener('click',()=>makeCsv(b.dataset.export)));
$('#backupBtn').addEventListener('click',()=>download(`facturacion_backup_${today()}.json`,JSON.stringify(db,null,2),'application/json'));
$('#restoreFile').addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;const rd=new FileReader();rd.onload=()=>{try{db=migrate(JSON.parse(rd.result));persist();clearInvoice();toast('Copia restaurada.')}catch{toast('El JSON no es válido.')}};rd.readAsText(f)});
renderAll();
clearInvoice();
