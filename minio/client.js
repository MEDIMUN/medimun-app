var Minio = require( 'minio' );

exports.minio = function () {
   let client = minioClient = new Minio.Client( {
      endPoint: 'media.medimun.org',
      port: 443,
      useSSL: true,
      accessKey: 'mediuser',
      secretKey: 'Qr!0IlTE@bP3'
   } );
   return client;
};