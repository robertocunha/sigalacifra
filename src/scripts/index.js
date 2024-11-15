// Imports de CSS para uso do Webpack 
import '../css/reset.css';
import '../css/print.css';
import '../css/style.css';

import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebaseConfig';

const fetchSongs = async () => {
  try {
    const songsCollection = collection(db, 'musicas');
    const songsSnapshot = await getDocs(songsCollection);

    const tableBody = document.getElementById('songs-table').querySelector('tbody');
    tableBody.innerHTML = ''; // Limpa qualquer conteúdo antigo

    songsSnapshot.forEach((doc) => {
      const { title, tone, position } = doc.data();

      // Cria uma nova linha para cada música
      const row = document.createElement('tr');
      row.style.cursor = 'pointer';

      // Cria células para cada dado
      row.innerHTML = `
        <td>${title}</td>
        <td>${tone}</td>
        <td>${position}</td>
      `;

      // Adiciona o evento de clique para redirecionar para song.html
      row.addEventListener('click', () => {
        // A implementação do link exato para song.html virá depois
        console.log(`Clicou em: ${title}`);
        // window.location.href = `song.html?id=${doc.id}`; // Apenas uma nota para futura implementação
      });

      // Insere a linha na tabela
      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error('Erro ao buscar músicas:', error);
  }
};

// Chama a função ao carregar o script
fetchSongs();
