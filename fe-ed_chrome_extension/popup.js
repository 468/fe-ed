let supabaseToken = '';

const NEPHILA_URL = "http://localhost:3000"
// const NEPHILA_URL = "https://www.fe-ed.world"
const COOKIE_DOMAIN = 'localhost'
// const COOKIE_DOMAIN = 'fe-ed.world'

document.getElementById('loading').style.display = 'block';

chrome.cookies.getAll({ domain: COOKIE_DOMAIN, name: 'supabase-auth-token' }, function(cookies) {
  document.getElementById('loading').style.display = 'none';

  if (cookies[0]) {
    const cookie = cookies[0]
    supabaseToken = cookie.value;
    document.getElementById('message').style.display = 'none';
    document.getElementById('sendButton').style.display = 'block';
    document.getElementById('loggedIn').style.display = 'block';
  } else {
    document.getElementById('message').style.display = 'block';
    document.getElementById('sendButton').style.display = 'none';
    document.getElementById('loggedIn').style.display = 'none';
  }
});

document.getElementById('sendButton').onclick = function() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const url = tabs[0].url;
    const title = tabs[0].title;
    const tab = tabs[0];
    console.log('tab below...')
    console.log(tab);
    function returnPage() {
      return document.body.innerHTML;
  }

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: returnPage,
    }).then((data) => {

      fetch(`${NEPHILA_URL}/api/external-submit-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseToken}`
        },
        body: JSON.stringify({url: url, title: title, html: data[0].result}),
      })
      .then(() => {
        console.log('Submission initiated');
        window.close();
      })
      .catch((error) => {
        console.error('Error:', error);
      })
      .finally(() => {
        window.close(); 
      });
    });
  });
};
