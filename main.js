const darkModeToggle = new DarkModeToggle({
    toggleElement: '#darkModeToggle',
    toggleTarget: 'body',
    darkModeClassName: 'dark-mode',
    lightModeClassName: 'light-mode',
});

async function getUserDetails() {
    const username = document.getElementById('username').value;
    const loadingDiv = document.getElementById('loading');

    try {
        loadingDiv.style.display = 'block';

        const response = await fetch(`https://api.github.com/users/${username}`);
        const userData = await response.json();

        if (response.status === 200) {
            displayUserDetails(userData);
        } else {
            displayErrorMessage(userData.message);
        }
    } catch (error) {
        displayErrorMessage('An error occurred while fetching user data.');
    } finally {
        loadingDiv.style.display = 'none';
    }
}

function displayUserDetails(user) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `
    <h2>${user.name || user.login}</h2>
    <p>Repositories: ${user.public_repos}</p>
    <p>Followers: ${user.followers}</p>
    <p><a href="${user.html_url}" target="_blank">Visit GitHub Profile</a></p>
    
    ${user.location ? `<p>Location: ${user.location}</p>` : ''}
    ${user.email ? `<p>Email: ${user.email}</p>` : ''}
    ${user.bio ? `<p>Bio: ${user.bio}</p>` : ''}

    <h3>Repositories:</h3>
    <ul id="repositoriesList"></ul>
    
    <h3>Contribution Graph:</h3>
    <canvas id="contributionGraphCanvas"></canvas>

    <h3>Repositories Language Distribution:</h3>
    <canvas id="languageDistributionCanvas"></canvas>
  `;

  populateRepositoriesList(user.login);
  renderContributionGraph(user.login);
  renderLanguageDistribution(user.login);
}

function displayErrorMessage(message) {
  const resultDiv = document.getElementById('result');
  resultDiv.innerHTML = `<p style="color: red;">Error: ${message}</p>`;
}

async function populateRepositoriesList(username) {
  try {
      const response = await fetch(`https://api.github.com/users/${username}/repos`);
      const repositoriesData = await response.json();

      const repositoriesList = document.getElementById('repositoriesList');
      repositoriesList.innerHTML = '';

      repositoriesData.forEach((repo) => {
          const listItem = document.createElement('li');
          listItem.innerHTML = `<a href="${repo.html_url}" target="_blank">${repo.name}</a>`;
          repositoriesList.appendChild(listItem);
      });
  } catch (error) {
      console.error('Error fetching repositories:', error);
  }
}

async function renderContributionGraph(username) {
  try {
      const response = await fetch(`https://api.github.com/users/${username}/events`);
      const eventsData = await response.json();

      const contributionData = eventsData
          .filter(event => event.type === 'PushEvent')
          .map(event => ({
              date: new Date(event.created_at).toLocaleDateString(),
              count: event.payload.commits.length,
          }));

      const ctx = document.getElementById('contributionGraphCanvas').getContext('2d');
      new Chart(ctx, {
          type: 'bar',
          data: {
              labels: contributionData.map(data => data.date),
              datasets: [{
                  label: 'Number of Contributions',
                  data: contributionData.map(data => data.count),
                  backgroundColor: 'rgba(75, 192, 192, 0.2)',
                  borderColor: 'rgba(75, 192, 192, 1)',
                  borderWidth: 1
              }]
          },
          options: {
              scales: {
                  y: {
                      beginAtZero: true
                  }
              }
          }
      });
  } catch (error) {
      console.error('Error rendering contribution graph:', error);
  }
}

async function renderLanguageDistribution(username) {
  try {
      const response = await fetch(`https://api.github.com/users/${username}/repos`);
      const repositoriesData = await response.json();

      const languageData = repositoriesData
          .filter(repo => repo.language)
          .reduce((acc, repo) => {
              const lang = repo.language;
              acc[lang] = (acc[lang] || 0) + 1;
              return acc;
          }, {});

      const ctx = document.getElementById('languageDistributionCanvas').getContext('2d');
      new Chart(ctx, {
          type: 'doughnut',
          data: {
              labels: Object.keys(languageData),
              datasets: [{
                  data: Object.values(languageData),
                  backgroundColor: [
                      'rgba(255, 99, 132, 0.7)',
                      'rgba(54, 162, 235, 0.7)',
                      'rgba(255, 206, 86, 0.7)',
                      'rgba(75, 192, 192, 0.7)',
                      'rgba(153, 102, 255, 0.7)',
                  ],
                  hoverOffset: 4
              }]
          }
      });
  } catch (error) {
      console.error('Error rendering language distribution:', error);
  }
}

function toggleTheme() {
  darkModeToggle.toggle(); // Toggle the theme using DarkModeToggle
}