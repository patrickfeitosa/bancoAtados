var express = require('express');
var app = express();

app.use(express.static(__dirname + '/public'));
app.use(express.bodyParser());

var accounts = [
	{ name: 'Patrick', number: '415', pass: '123', current_balance: 500 },
	{ name: 'Atados', number: '123', pass: '415', current_balance: 320 },
]

app.listen(process.env.PORT || 3412);

app.all('*', function (req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
	res.header('Access-Control-Allow-Headers', 'Content-Type');
	next();
});


//Rotas para Saque
app.get('/saque/:number/:pass/:valor', function (req, res) {

	//Declaração das variáveis para pegar os parametros
	const number = req.params.number;
	const pass = req.params.pass;
	const valor = req.params.valor;

	accounts.forEach(function (element) {
		if (element.number === number && element.pass === pass) {
			if (element.current_balance >= valor) {

				//Coletando informações necessárias
				var currentBalance = element.current_balance
				var newBalance = currentBalance - valor;

				//Setando novo valor atual da conta;
				element.current_balance = newBalance;

				//Variaveis para quantidades de nota
				var qtdCem = 0, qtdCinquenta = 0, qtdVinte = 0, qtdDez = 0, qtdCinco = 0, qtdDois = 0;
				var calcVal;

				calcVal = valor;
				do {
					if (calcVal % 100 == 0) {
						qtdCem++;
						calcVal = calcVal - 100;
					} else if (calcVal % 50 == 0) {
						qtdCinquenta++;
						calcVal = calcVal - 50;
					} else if (calcVal % 20 == 0) {
						qtdVinte++;
						calcVal = calcVal - 20;
					} else if (calcVal % 10 == 0) {
						qtdDez++;
						calcVal = calcVal - 10;
					} else if (calcVal % 5 == 0) {
						qtdCinco++;
						calcVal = calcVal - 5;
					} else if (calcVal % 2 == 0) {
						qtdDois++;
						calcVal = calcVal - 2;
					}
				} while (calcVal > 0);
 
				var saqueInformation = [
					{
						mensagem: 'Saque no valor de R$ ' + valor + ' realizado com sucesso',
						Quantidade_Cem: qtdCem,
						Quantidade_Cinquenta: qtdCinquenta,
						Quantidade_Vinte: qtdVinte,
						Quantidade_Dez: qtdDez,
						Quantidade_Cinco: qtdCinco,
						Quantidade_Dois: qtdDois
					}
				]
				res.json(saqueInformation);
			} else {
				res.send('Saldo insuficiente para Saque');
			}
		}
	});
});

//Rotas para Transferencia
app.get('/transferencia/:number_sending/:pass_sending/:number_receiving/:valor', function (req, res) {

	//Declaração das variáveis para pegar os parametros
	const number_sending = req.params.number_sending;
	const pass_sending = req.params.pass_sending;
	const number_receiving = req.params.number_receiving;
	const valor = req.params.valor;

	//Variaveis para validação dos campos
	var autentication = false;
	var receiverExist = false;
	var indexAccountSending = 0;
	var indexAccountReceiving = 0;
	var i = 0;

	accounts.forEach(function (element) {

		//Validação da conta que esta transferindo dinheiro
		if (element.number === number_sending && element.pass === pass_sending && element.current_balance >= valor && autentication != true) {
			autentication = true;
			indexAccountSending = i;
		}

		//Validação da conta que esta recebendo dinheiro
		if (element.number === number_receiving) {
			receiverExist = true;
			indexAccountReceiving = i;
		}
		i++;
	});
	;

	res.json(transactionDone(autentication, receiverExist, indexAccountSending, indexAccountReceiving, valor))
});

//Função para finalizar a transação
function transactionDone(a, r, ias, iar, v) {

	var transactionData;

	if (a === false) {
		transactionData = [
			{
				message: 'Conta e senha incorreta ou Saldo Insuficiente'
			}
		];
	} else if (r === false) {
		transactionData = [
			{
				message: 'Conta receptora inexistente ou incorreta'
			}
		];
	} else {

		//Tratativa da conta que está enviando
		var currentBalanceSending = accounts[ias].current_balance;
		var newBalanceSending = currentBalanceSending - v;
		accounts[ias].current_balance = newBalanceSending;

		//Tratativa da conta que esta recebendo		
		var currentBalanceReceiving = accounts[iar].current_balance;
		var newBalanceReceiving = currentBalanceReceiving + v;
		accounts[iar].current_balance = newBalanceReceiving;

		transactionData = [
			{
				Conta_Retirante: accounts[ias].pass,
				Conta_Receptora: accounts[iar].pass,
				Saldo_Atual_Retirante: newBalanceSending,
				Valor_Transferencia: v,
				message: 'Transferencia Realizada com sucesso'
			}
		];
	}

	return transactionData;
};