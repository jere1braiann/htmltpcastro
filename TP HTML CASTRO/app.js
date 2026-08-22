// ==========================================
// 1. SISTEMA DE NAVEGACIÓN (Router SPA)
// ==========================================
function navegar(idVista) {
    // Oculta todas las secciones
    document.querySelectorAll('.vista').forEach(seccion => {
        seccion.classList.remove('activa');
    });
    // Muestra solo la solicitada
    document.getElementById(`vista-${idVista}`).classList.add('activa');

    // Ejecuta funciones específicas al entrar a una vista
    if (idVista === 'actas') renderizarActas();
    if (idVista === 'foro') renderizarForo();
}

// ==========================================
// 2. MÓDULO DE ELECCIONES (Simulador)
// ==========================================
const padronSimulado = ["ALUMNO-1", "ALUMNO-2", "ALUMNO-3"];
let alumnosQueYaVotaron = [];

const listasElectorales = [
    { id: 1, nombre: "Frente Estudiantil Unido", presi: "Ana García", color: "red" },
    { id: 2, nombre: "Renovación Secundaria", presi: "Martín López", color: "green" },
    { id: 3, nombre: "Voto en Blanco", presi: "-", color: "grey" }
];

function iniciarVotacion() {
    const codigo = document.getElementById('codigo-alumno').value.trim().toUpperCase();
    const msjError = document.getElementById('error-login');

    if (!padronSimulado.includes(codigo)) {
        msjError.innerText = "Ese código no existe en el padrón.";
        msjError.style.display = "block";
        return;
    }

    if (alumnosQueYaVotaron.includes(codigo)) {
        msjError.innerText = "Este código ya emitió su voto.";
        msjError.style.display = "block";
        return;
    }

    // Si pasa validaciones, muestra el cuarto oscuro
    document.getElementById('login-votante').style.display = "none";
    document.getElementById('pantalla-boletas').style.display = "block";
    renderizarBoletas(codigo);
}

function renderizarBoletas(codigoAlumno) {
    const contenedor = document.getElementById('contenedor-listas');
    contenedor.innerHTML = '';

    listasElectorales.forEach(lista => {
        contenedor.innerHTML += `
            <div class="col s12 m4">
                <div class="card ${lista.color} lighten-2 white-text center-align" style="cursor:pointer;" onclick="emitirVoto(${lista.id}, '${codigoAlumno}')">
                    <div class="card-content">
                        <h4>${lista.nombre}</h4>
                        <p>Presidente: ${lista.presi}</p>
                        <br>
                        <button class="btn white black-text">VOTAR</button>
                    </div>
                </div>
            </div>
        `;
    });
}

function emitirVoto(idLista, codigoAlumno) {
    if (confirm("¿Confirmas tu voto? Es secreto y definitivo.")) {
        // En una app real, el código se borra aquí. En la maqueta lo guardamos para bloquearlo.
        alumnosQueYaVotaron.push(codigoAlumno); 
        alert("¡Voto registrado con éxito!");
        
        // Resetea la terminal para el siguiente alumno
        document.getElementById('pantalla-boletas').style.display = "none";
        document.getElementById('login-votante').style.display = "block";
        document.getElementById('codigo-alumno').value = "";
        navegar('inicio');
    }
}

// ==========================================
// 3. MÓDULO DE ACTAS (Simulador de Base de Datos)
// ==========================================
const baseDatosActas = [
    { fecha: "15/05/2026", titulo: "Asamblea Conformación Junta Electoral", lugar: "SUM" },
    { fecha: "02/06/2026", titulo: "Presupuesto Bufet 2do Trimestre", lugar: "Aula 4" }
];

function renderizarActas() {
    const lista = document.getElementById('lista-actas');
    lista.innerHTML = '';
    
    baseDatosActas.forEach(acta => {
        lista.innerHTML += `
            <li class="collection-item avatar">
                <i class="material-icons circle blue">description</i>
                <span class="title"><strong>${acta.titulo}</strong></span>
                <p>${acta.fecha} - Lugar: ${acta.lugar}</p>
                <a href="#!" class="secondary-content"><i class="material-icons">file_download</i></a>
            </li>
        `;
    });
}

// ==========================================
// 4. MÓDULO DE FORO (Usando LocalStorage para mantener datos)
// ==========================================
function obtenerPropuestas() {
    const datos = localStorage.getItem('foroDigital');
    return datos ? JSON.parse(datos) : [
        { titulo: "Más tachos de reciclaje", texto: "Necesitamos separar la basura en los patios.", votos: 5 }
    ];
}

function renderizarForo() {
    const contenedor = document.getElementById('lista-propuestas');
    contenedor.innerHTML = '';
    const propuestas = obtenerPropuestas();

    // Ordenar por votos
    propuestas.sort((a, b) => b.votos - a.votos).forEach((prop, index) => {
        contenedor.innerHTML += `
            <div class="card">
                <div class="card-content">
                    <span class="card-title">${prop.titulo} <span class="badge blue white-text">${prop.votos} votos</span></span>
                    <p>${prop.texto}</p>
                </div>
                <div class="card-action">
                    <button class="btn-small blue" onclick="votarPropuesta(${index})">Apoyar (+1)</button>
                </div>
            </div>
        `;
    });
}

function agregarPropuesta() {
    const titulo = document.getElementById('titulo-propuesta').value;
    const texto = document.getElementById('texto-propuesta').value;
    
    if(titulo === "" || texto === "") return alert("Completa los campos");

    const propuestas = obtenerPropuestas();
    propuestas.push({ titulo, texto, votos: 0 });
    localStorage.setItem('foroDigital', JSON.stringify(propuestas));
    
    document.getElementById('titulo-propuesta').value = "";
    document.getElementById('texto-propuesta').value = "";
    renderizarForo();
}

function votarPropuesta(index) {
    const propuestas = obtenerPropuestas();
    propuestas[index].votos++;
    localStorage.setItem('foroDigital', JSON.stringify(propuestas));
    renderizarForo();
}
