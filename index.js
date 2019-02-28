const searchForm = document.getElementById('search-form');

searchForm.addEventListener('submit', e => {
  // Get subreddits
  const subreddits = document.querySelectorAll('input[name=subs]:checked');
  if (subreddits.length == 0) {
    showMessage('Please select a subreddit', 'alert-warning');
  }
  let sub_list = [];
  for (var sub of subreddits.values()) {
    sub_list.push(sub.value);
  }

  // Search Reddit
  reddit_api(sub_list.join('+')).then(results => {
    console.log(results);
    let output = '<div class="card-columns">';
    results.forEach(post => {
      // Handle gifs
      let media_html;
      let image = post.url;
      if (image.includes('gfycat')) {
        let gfycat_url = post.url;
        gfycat_url = gfycat_url.replace(
          'https://gfycat',
          'https://giant.gfycat'
        );
        gfycat_url += '.webm';
        media_html = `<video controls muted preload="auto" autoplay="autoplay" loop="loop" style="width: 100%;">
          <source src=${gfycat_url} type="video/webm"></source>
        </video>`;
      } else if (image.includes('gifv')) {
        // Replace with mp4
        let gifv_url = post.url;
        gifv_url = gifv_url.replace('.gifv', '.mp4');
        media_html = `<video  controls muted preload="auto" autoplay="autoplay" loop="loop" style="width: 100%;">
          <source src=${gifv_url} type="video/mp4"></source>
        </video>`;
      } else if (image.includes('v.redd')) {
        media_html = `<video  controls muted preload="auto" autoplay="autoplay" loop="loop" style="width: 100%;">
          <source src=${
            post.media.reddit_video.scrubber_media_url
          } type="video/webm"></source>
        </video>`;
      } else if (image.includes('https://imgur')) {
        let img_url = post.url;
        img_url = img_url.replace('imgur', 'i.imgur');
        img_url += '.jpg';
        media_html = `<img class="card-img-top" src="${img_url}" alt="Card image cap">`;
      } else {
        media_html = `<img class="card-img-top" src="${
          post.url
        }" alt="Card image cap">`;
      }
      output += `
      <div class="card mb-2">
      ${media_html}
      <div class="card-body">
        <h5 class="card-title">${post.title}</h5>
        <p class="card-text">${truncateString(post.selftext, 100)}</p>
        <a href="https://www.reddit.com${post.permalink}" target="_blank
        " class="btn btn-primary">Permalink</a>
        <hr>
        <span class="badge badge-secondary">Subreddit: ${post.subreddit}</span> 
        <span class="badge badge-dark">Score: ${post.score}</span>
      </div>
    </div>
      `;
    });
    output += '</div>';
    document.getElementById('results').innerHTML = output;
  });

  e.preventDefault();
});

// Show Message Function
function showMessage(message, className) {
  // Create div
  const div = document.createElement('div');
  // Add classes
  div.className = `alert ${className}`;
  // Add text
  div.appendChild(document.createTextNode(message));
  // Get parent
  const searchContainer = document.getElementById('search-container');
  // Get form
  const search = document.getElementById('search');

  // Insert alert
  searchContainer.insertBefore(div, search);

  // Timeout after 2 secs
  setTimeout(function() {
    document.querySelector('.alert').remove();
  }, 2000);
}

// Truncate String Function
function truncateString(myString, limit) {
  const shortened = myString.indexOf(' ', limit);
  if (shortened == -1) return myString;
  return myString.substring(0, shortened);
}

function reddit_api(subreddits) {
  return fetch(`https://www.reddit.com/r/${subreddits}/top/.json?limit=50`)
    .then(res => res.json())
    .then(data => {
      return data.data.children.map(data => data.data);
    })
    .catch(err => console.log(err));
}
