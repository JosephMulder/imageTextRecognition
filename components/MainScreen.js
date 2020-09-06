import React, { Component, useRef } from 'react';
import { SafeAreaView, Text, View, Dimensions, Linking } from 'react-native';
import Clipboard from "@react-native-community/clipboard";
import Header from './Header.js';
import Main from './Main.js';
import Footer from './Footer.js';

const window = Dimensions.get("window");

export default class MainScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      cameraShowing: true,
      torchMode: false,
      textFound:      [ { bounds: { origin: { x: 0, y: 0 }, size: { width: 0, height:  0} }, value: "" } ],
      savedTextFound: [ { bounds: { origin: { x: 0, y: 0 }, size: { width: 0, height:  0} }, value: "" } ],
      cameraPreview: {
        height: window.height -200,
        width: window.width,
        alignItems: 'center',
        justifyContent: 'center',
        display: "flex"
      },
      OCRPreview: {
        flex: 1,
        backgroundColor: 'white', 
        display: "none",
        margin: 10
      }
    };
  }

  
    changeMainView = () => {
      let { cameraShowing, OCRPreview, cameraPreview, textFound } = this.state;

      this.setState({
        cameraPreview: { ...cameraPreview, display: cameraPreview.display === "none" ? "flex" : "none" },
        OCRPreview: { ...OCRPreview, display: OCRPreview.display === "none" ? "flex" : "none"  },
        savedTextFound: textFound,
        cameraShowing: !cameraShowing
      }, () => console.log(this.state.cameraPreview))
    }

    textRecognized = (e) => {
      let textArr = [];
      if (e.textBlocks) {
        for (let i = 0; i < e.textBlocks.length;i++) {
          if (e.textBlocks[i].components.length > 0) {
            textArr.push(e.textBlocks[i]);
          }
        }
      }
      this.setState({
        textFound: textArr,
      });
    }

    copyToClipBoard = () => {
      let allOCRString = "";
      this.state.savedTextFound.forEach( ( ORC ) => { allOCRString += " " + ORC.value });
      Clipboard.setString(allOCRString);
    }

    emailMessage = () => {
      let allOCRString = "";
      let unwantedChars = "=<>/$%=?"; // Next line removes all the characters that will make the opening of the email not work.
      this.state.savedTextFound.forEach( ( ORC ) => { allOCRString += " " + ORC.value.split("").filter( (char) => unwantedChars.indexOf(char) === -1 ).join("") });
      Linking.openURL(`mailto:?body=${allOCRString}`)
    }

    toggleTorchMode = () => {
      this.setState({
        torchMode: !this.state.torchMode
      });
    }

  render() { 
    let { cameraShowing, OCRPreview, cameraPreview, textFound, savedTextFound, torchMode } = this.state;
    let cameraBtnText = cameraShowing ? "Get Text" : "Go Back";

    return (
      <SafeAreaView style={{flex: 1}}>

          <Header size={window.width / 16} copyToClipBoard={this.copyToClipBoard} emailMessage={this.emailMessage} toggleTorchMode={this.toggleTorchMode}/>
          
          <Main OCRPreview={OCRPreview} cameraPreview={cameraPreview} savedTextFound={savedTextFound} textRecognized={this.textRecognized} torchMode={torchMode} />

          <Footer changeMainView={this.changeMainView} cameraBtnText={cameraBtnText}/>
 
          {textFound.map((text, index) => (//This is the absolute positioned text for the live updates on the OCR text captured
            <View style={{ position: 'absolute', zIndex: 15, top: text.bounds.origin.y +100, left: text.bounds.origin.x, width: text.bounds.size.width, height: text.bounds.size.height, backgroundColor: 'purple', opacity:.7 }} key={index}>
              <Text style={{fontSize: 8, color: "#39ff14"}} >{text.value}</Text>
            </View>
           ))}

      </SafeAreaView>
    );
  }
}