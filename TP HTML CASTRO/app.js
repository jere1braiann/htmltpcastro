function agregarLista() {
    const numero = document.getElementById('input-numero').value;
    const nombre = document.getElementById('input-nombre-partido').value;
    const presi = document.getElementById('input-presidente').value;
    const vice = document.getElementById('input-vicepresidente').value;
    const curso = document.getElementById('input-curso').value;
    const color = document.getElementById('input-color').value;
    const tieneAval = document.getElementById('check-aval').checked;

    // Validación según estatuto
    if (!numero || !nombre || !presi || !vice || !curso || !color) {
        alert("Por favor, completa todos los datos de los candidatos y la lista.");
        return;
    }
    
    if (!tieneAval) {
        alert("Atención: Según el Art. 28 inc. d, no se puede oficializar la lista sin el aval del 10% del padrón.");
        return;
    }

    const listas = obtenerListas();
    const nuevoId = new Date().getTime(); 
    
    // Guardamos todos los datos estructurados
    listas.push({ 
        id: nuevoId, 
        numero: numero, 
        nombre: nombre, 
        presi: presi, 
        vice: vice,
        curso: curso,
        color: color 
    });
    
    localStorage.setItem('listasOficiales', JSON.stringify(listas));
    
    // Limpiar formulario tras oficializar
    document.getElementById('input-numero').value = "";
    document.getElementById('input-nombre-partido').value = "";
    document.getElementById('input-presidente').value = "";
    document.getElementById('input-vicepresidente').value = "";
    document.getElementById('input-curso').value = "";
    document.getElementById('input-color').value = "";
    document.getElementById('check-aval').checked = false;

    renderizarPanelAdmin();
    alert("Lista " + numero + " oficializada con éxito por la Junta Electoral.");
}

function renderizarPanelAdmin() {
    const votosStorage = JSON.parse(localStorage.getItem('votosEleccion')) || [];
    document.getElementById('contador-votos').innerText = votosStorage.length;

    const contenedorListas = document.getElementById('admin-listas-activas');
    contenedorListas.innerHTML = "";
    const listas = obtenerListas();

    listas.forEach(lista => {
        const cantVotos = votosStorage.filter(v => v === lista.id).length;
        
        contenedorListas.innerHTML += `
            <div class="boleta-preview ${lista.color} darken-1">
                <strong>Lista ${lista.numero} - ${lista.nombre}</strong><br>
                Fórmula: ${lista.presi} / ${lista.vice || "N/A"}<br>
                <small>Curso: ${lista.curso || "N/A"}</small>
                <span class="badge white black-text right">${cantVotos} VOTOS</span>
            </div>
        `;
    });
}

function renderizarBoletasVotante(codigoAlumno) {
    const contenedor = document.getElementById('contenedor-listas');
    contenedor.innerHTML = '';
    const listas = obtenerListas();

    listas.forEach(lista => {
        // Renderizamos la tarjeta que verá el alumno en el cuarto oscuro
        contenedor.innerHTML += `
            <div class="col s12 m4">
                <div class="card ${lista.color} darken-2 white-text center-align" style="cursor:pointer;" onclick="emitirVoto(${lista.id}, '${codigoAlumno}')">
                    <div class="card-content">
                        <h5>Lista ${lista.numero}</h5>
                        <h4>${lista.nombre}</h4>
                        <p><strong>Presidente:</strong> ${lista.presi}</p>
                        ${lista.vice ? `<p><strong>Vicepresidente:</strong> ${lista.vice}</p>` : ''}
                        <br>
                        <button class="btn white black-text">SELECCIONAR BOLETA</button>
                    </div>
                </div>
            </div>
        `;
    });
}
