(function () {
    "use strict";

    const SerialPort = require('serialport');
    const Readline = SerialPort.parsers.Readline;

    class RadioGW {

        constructor(){
            this.serialPortConnected = false;
            this.load();
        }

        load(){
            this.remotesAllowed = new Set();
            this.remotesAllowed.add("IDSA000100000001001011110001");
        }

        connect(usbPort){
            this.usbPort = usbPort;
            this.reconnect();
        }

        reconnect(){
            this.port = new SerialPort(this.usbPort, {
                baudRate: 2400
            });
            this.parser = this.port.pipe(new Readline({ delimiter: '\r\n' }));
            this.addEventListeners();
        }

        addEventListeners(){
            this.port.on('open', function() {
              console.log('Conexão aberta!');
              this.serialPortConnected = true;
            }.bind(this));

            this.parser.on('data', (data) => {
                this.onReceiveData(data);
            });

            //Tratamentos para caso de erro na conexão
            this.port.on('close', (data) => {
                console.error('Closed: ', data);
                this.onError('Perdida conexão com a porta serial!');
            });
            this.port.on('error', function(err) {
                console.error('Error: ', err.message);
                this.onError(err.message);
            });
        }

        onError(msg){
            this.serialPortConnected = false;
        }

        onReceiveData(data){
            console.log('Recebido =>', data);
            //Não emite mais os eventos das respostas que contem caracteres inválidos
            if(this.containsOnlyValidCharacters(data)){
                if(this.remotesAllowed.has(data)){
                    console.log('ACESSO PERMITIDO!');
                }else{
                    console.log('ACESSO NEGADO!');
                }
            }else{
                console.log('Desconsiderado dado por conter caracteres inválidos!');
            }
        }

        containsOnlyValidCharacters(inputtxt) {
          //When you have both ^ and $ you tell the engine that whatever is in between them must cover the entire line end-to-end
          let lettersNumbersSpacesOnly = /^[0-9a-zA-Z-\s]+$/;
          return lettersNumbersSpacesOnly.test(inputtxt);
        }

    }

    let radioGW = new RadioGW();
    radioGW.connect("/dev/ttyUSB0");

})();