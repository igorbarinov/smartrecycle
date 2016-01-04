/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

var React = require('react-native');
var {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Image,
  NativeModules,
  TouchableHighlight,
  AlertIOS,

} = React;
var Camera = require('react-native-camera');
var { NativeModules } = require('react-native');

var base64 = require('base-64');
// var Base64 = require('js-base64/base64.js').Base64;


var Capture = React.createClass({
  getInitialState:function() {
    return {
      cameraType: Camera.constants.Type.back
    }
  },
//
  render: function() {
    return (
 <Camera
        ref="cam"
        style={styles.container}
        onBarCodeRead={this._onBarCodeRead}
        type={this.state.cameraType}
        aspect="fit">

        <TouchableHighlight onPress={this._sendPicture}>
          <Text style={styles.welcome}>Recognize</Text>
        </TouchableHighlight>

      </Camera>
    );
  },

  _onBarCodeRead: function(e) {
    console.log(e);
  },
  _switchCamera: function() {
    var state = this.state;
    state.cameraType = state.cameraType === Camera.constants.Type.back
      ? Camera.constants.Type.front : Camera.constants.Type.back;
    this.setState(state);
  },
  _sendPicture: function() {

    /*

    TODO: fetch


    var form = new FormData();
    form.append("FormData", true)
    form.append('file', this.state.uri)

    fetch('http://c7f42a13.ngrok.io', {
      body: form,
      mode: "FormData",
      method: 'POST',
      headers: {
        'Accept':'application/json',
        'Content-Type': 'application/json'
      }
    })
    .then((response) => response.json())
          .catch((error) => {
             alert("ERROR " + error)
          })
          .then((responseData) => {
             alert("Succes "+ responseData)
          })
          .done();
          */
this.refs.cam.capture(function(err, data) {
var uri = data;
var uploadUrl = "http://c7f42a13.ngrok.io";
//var uploadUrl = "http://172.20.10.5:5000"
var fileName = "image.png";
var mimeType = "multipart/form-data";
var headers = {"Content-Type": "multipart/form-data"};
var fileKey = "file";

var obj = {
    uri, // either an 'assets-library' url (for files from photo library) or an image dataURL
    uploadUrl,
    fileName,
    fileKey, // (default="file") the name of the field in the POST form data under which to store the file
    mimeType,
    headers,
    data: {
        // whatever properties you wish to send in the request
        // along with the uploaded file
    }
};
NativeModules.FileTransfer.upload(obj, (err, res) => {
    // handle response
    // it is an object with 'status' and 'data' properties
    // if the file path protocol is not supported the status will be 0
    // and the request won't be made at all
    console.log(res.status);

    AlertIOS.alert(
            res.data,
            null,
            [
              {text: 'OK', onPress: (text) => console.log('OK pressed')},
            ],
            'default'
          )

    //alert(res.data);
});


      //  var headers = {"Content-Type": "application/octet-stream", "Authorization": "Bearer gRGNCKg9hoh1JnmQvIPH2_W2Bmx5OcKJLvmJBqRLjJhV4bzIarcXRueJVGOUwkUV3wCTWkcIN9Xvxbr0Nx-nnP8Fp7Eqlg5keCha921adh0bsByrO37uTtk4U1wbjFDHYz5mX_nuf6T5B8iQVMa2ANMlTwYXUjOWPJOTM79vBzw_AAABUgZZtiiWS3g2MTVVZjNCazhiTXE2OWRNR0pwZ4AA5Goi1gRpc5KpuKn3_SZdpIAACoCAgIGDgIaAgoCFgIaBgYKHgIeC"};
      //  var uploadUrl = "https://api.theidplatform.com/1/recognition/image?include=entity";
      //  var uploadUrl = "http://requestb.in/15uht0q1";
      //   NativeModules.ReadImageData.readImage(this.state.uri, (image) => {
      //   fetch(uploadUrl, {body: image , method: "post", headers: headers})
      //      .then((response) => {
      //       console.log(response);
      //      return response.json()
      //    })
      //     .catch((error) => {
      //        alert(error)
      //     })
      //     .then((responseData) => {
      //        console.log(responseData);
      //        //alert(responseData);
      //     })
      //     .done();
      // });
});
  },
  _takePicture: function() {

    var _this = this;

    this.refs.cam.capture(function(err, data) {
      alert(data);
      console.log(err, data.data);


    _this.setState({"uri": data})



      // var uploadUrl = "http://requestb.in/15uht0q1";
      //
      // var fileName = "image.png";

      // var mimeType = "application/octet-stream";

      // var uri = data;
      // var fileKey = "file";



       // fetch('http://requestb.in/15uht0q1', {body: data , method: "post", headers: {"Content-Type": "application/octet-stream",
       //  "Authorization": "Bearer gQ033jRPylrmTaglo3Eli-rPFkV_001B1ZQQwAnwfTh6PHENCN8U5hr_vMiBT5sUL9BMCxMCldZchvIpcVv467k-npAGZVMs4vv4G3e2aEqSxn3N5MiFedUkfriFWErh-WQnR84EMa1p7XPas3xs_dVmjd4Zz8x7Tfr94qZZKr-zAAABUgULIv-WS3g2MTVVZjNCazhiTXE2OWRNR0pwZ4AA5Goi1gRpc5KpuKn3_SZdpIAACoCAgIGDgIaAgoCFgIaBgYKHgIeC"}})
       //    .then((response) => {
       //      console.log(response);
       //     return response.json()
       //   })
       //    .catch((error) => {
       //       alert(error)
       //    })
       //    .then((responseData) => {
       //       alert(responseData)
       //    })
       //    .done();


    });
  }
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 40,
    textAlign: 'center',
    margin: 10,
    padding: 10,
    color: 'white',
    backgroundColor: '#333333',
    marginBottom: 5

  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

AppRegistry.registerComponent('Capture', () => Capture);
