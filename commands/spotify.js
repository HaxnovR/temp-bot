const fetch = require('node-fetch');
const dotenv = require('dotenv').config({path:"../.env"});
var SpotifyWebApi = require('spotify-web-api-node');
const { MessageEmbed } = require("discord.js");

var spotifyApi = new SpotifyWebApi({
    clientId: process.env.spotify_id,
    clientSecret: process.env.spotify_secret,
  });

exports.run = (client, message, args) => {
    spotifyApi.clientCredentialsGrant().then(
        // NOTE
        // All commands run in this function
        function(data) {
            console.log('The access token expires in ' + data.body['expires_in']);
            console.log('The access token is ' + data.body['access_token']);
            
            // Save the access token so that it's used in future calls
            spotifyApi.setAccessToken(data.body['access_token']);
            
            // Query
            let qry = args.slice(1,args.length).join(" ");

            // functions
            async function argZero(){
                message.channel.send(" Usage: `n.spotify <options> <query>`\nOptions:`search`,");
            }
            async function getSearch(){
                let resp = await spotifyApi.searchTracks(qry,{ limit: 5, offset: 2 });
                let dat = resp.body.tracks.items;
                console.log(dat[0]);
                
                const embed = new MessageEmbed()
                    .setColor("1DB954")
                    .setAuthor(`Requested by ${message.author.username}${message.author.discriminator}`,message.author.displayAvatarURL())
                    .setTitle(`Results for "${qry}"`)
                    .setThumbnail(dat[0].album.images[0].url)
                    .setTimestamp()
                    .setFooter("Data from Spotify", "https://cdn-icons-png.flaticon.com/512/2111/2111624.png");
                
                dat.forEach(index => {
                    let divider = '----------------------------';
                    let names = [];
                    index.artists.forEach(num => {
                        names.push(num.name);
                    });
                    console.log(names.join(", "));
                    // embed.addField(index.name , `\[[Link](${index.external_urls.spotify})\], Followers: \`${index.followers.total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}\`\nGenres: \`${genres}\`\n${divider}`)
                });
                message.channel.send({ embeds: [embed] });
            }
            async function getArtist(){
                let resp = await spotifyApi.searchArtists(qry,{limit: 4});
                let dat = resp.body.artists.items;
                console.log(dat[0].images[0].url);

                const embed = new MessageEmbed()
                    .setColor("1DB954")
                    .setAuthor(`Requested by ${message.author.username}${message.author.discriminator}`,message.author.displayAvatarURL())
                    .setThumbnail(dat[0].images[0].url)
                    .setTitle(`Results for "${qry}"`)
                    .setTimestamp()
                    .setFooter("Data from Spotify", "https://cdn-icons-png.flaticon.com/512/2111/2111624.png");
                      
                // Field Builder
                dat.forEach(index => {
                    let divider = '----------------------------';
                    let genres = index.genres.join(", ");
                    embed.addField(index.name , `\[[Link](${index.external_urls.spotify})\], Followers: \`${index.followers.total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}\`\nGenres: \`${genres}\`\n${divider}`)
                })

                message.channel.send({ embeds: [embed] });
            }

            // args check
            if(args[0]==null){
                argZero();
                return;
            }
            if(args[0]=='search' && args[1] != null ? getSearch() : null);
            if(args[0]=='artist' && args[1] != null ? getArtist() : null);
            else argZero();
        },
    
        function(err) {
            console.log('Something went wrong when retrieving an access token', err);
        }
    );
}



