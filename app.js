//importing modules
var express = require( 'express' );
var request = require( 'request' );
var cheerio = require( 'cheerio' );

//creating a new express server
var app = express();

//setting EJS as the templating engine
app.set( 'view engine', 'ejs' );

//setting the 'assets' directory as our static assets dir (css, js, img, etc...)
app.use( '/assets', express.static( 'assets' ) );


//makes the server respond to the '/' route and serving the 'home.ejs' template in the 'views' directory
app.get( '/', function ( req, res ) {
    var URL = req.query.urlLBC

    if ( URL ) {
        callLBC( URL, res )
    }
    else {

        res.render( 'home', {
            message: 'Comparateur de prix pour Appartement'
        });
    }
});


//launch the server on the 3000 port
app.listen( 3000, function () {
    console.log( 'App listening on port 3000!' );
});

function callLBC( _url, res ) {
    request( _url, function ( error, response, body ) {
        if ( !error && response.statusCode == 200 ) {
            var url = cheerio.load( body )
            var firstPrice = url( 'span.value' ).eq( 0 ).text()

            var price = url( 'span.value' ).eq( 0 ).text().replace( '€', '' )
            price = price.replace( / /g, "" )



            console.log( price )
            var nomVille = url( 'span.value' ).eq( 1 ).text().split( ' ' )[0]
            var codePostal = url( 'span.value' ).eq( 1 ).text().split( ' ' )[1]
            var typeDeBien = url( 'span.value' ).eq( 2 ).text()
            var surface = url( 'span.value' ).eq( 4 ).text().split( ' ' )[0]
            console.log( surface )
            var prixAuMetreCarre = price / surface
            console.log( prixAuMetreCarre )


            request( 'http://www.meilleursagents.com/prix-immobilier/' + nomVille.toLowerCase() + '-' + codePostal, function ( error, response, body ) {
                if ( !error && response.statusCode == 200 ) {
                    var url2 = cheerio.load( body )
                    var prixMoyenAppartement = url2( 'div.small-4.medium-2.columns.prices-summary__cell--median' ).eq( 0 ).text().replace( '€', '' ).replace( /\s/g, '' )
                    prixMoyenAppartement = parseFloat( prixMoyenAppartement )
                    var prixMoyenMaison = url2( 'div.small-4.medium-2.columns.prices-summary__cell--median' ).eq( 1 ).text().replace( '€', '' ).replace( /\s/g, '' )
                    var message = ' '
                    if ( typeDeBien == 'Appartement' ) {
                        if ( prixMoyenAppartement > prixAuMetreCarre ) {
                            message = 'Bon deal, le prix moyen au mètre carré de cet appartement est inférieur au prix moyen du mètre carré de la région'
                        }
                        else {
                            message = 'Mauvais deal, le prix moyen au mètre carré de cet appartement est supérieur au prix moyen du mètre carré de la région'
                        }
                    }
                    else {
                        if ( prixMoyenMaison > prixAuMetreCarre ) {
                            message = 'Bon deal, le prix moyen au mètre carré de cette maison est inférieur au prix moyen du mètre carré de la région'
                        }
                        else {
                            message = 'Mauvais deal, le prix moyen au mètre carré de cette maison est supérieur au prix moyen du mètre carré de la région'
                        }

                    }

                    res.render( 'home', {
                        message: message
                    });
                }
            })
        }
    })
}