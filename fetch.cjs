const https = require('https');
const fs = require('fs');

https.get('https://iticket.az', (res) => {
    let data = '';
    res.on('data', chunk => { data += chunk; });
    res.on('end', () => {
        const matches = data.match(/href="(\/_nuxt\/[^\"]+\.css)"/g);
        if (matches && matches.length > 0) {
            const url = 'https://iticket.az' + matches[0].replace('href="', '').replace('"', '');
            https.get(url, (res2) => {
                let css = '';
                res2.on('data', chunk => { css += chunk; });
                res2.on('end', () => {
                    fs.writeFileSync('iticket.css', css);
                    console.log('Saved to iticket.css');
                });
            });
        }
    });
});
