const btnNew = document.querySelector('.btn-new')
const overlay = document.querySelector('.overlay')

const form = document.getElementById('form')
const cancelBtn = document.querySelector('.form-btn.cancel')
const saveBtn = document.querySelector('.form-btn.save')

const table = document.getElementById('table')

// const transactions = JSON.parse(localStorage.getItem('transaction'))
const inputValue = []

//Open and Close Modal
const Modal = {
    open(){
        overlay.classList.add('active')
        form.classList.toggle('active')
    },
    close(){
        overlay.classList.remove('active')
        form.classList.remove('active')
    }
}

const Utils = {
    formatCurrency(amount, type){
        const transactionSymbol = type === "INCOME" ? "" : "-"

        amount = Number(amount) / 100
        amount = amount.toLocaleString('pt-br', {
            style: 'currency',
            currency: 'BRL',
        })
    
        return (transactionSymbol + amount)
    },

    formatAmount(value){
        value = Number(value) * 100        
        return value
    },

    formatDate(date){
        const splittedDate = date.split('-')
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },
    formatType(type){
        return type === "0" ? "INCOME" : "EXPENSE"
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },
    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    }
}

const Transaction = {
    all: Storage.get(),
    add(transactions){
        Transaction.all.push(transactions)
        App.reload()
    },
    remove(index){
        Transaction.all.splice(index, 1)
        App.reload()
    },

    incomes(){
        let income = 0
        Transaction.all.forEach(transaction => {
            if(transaction.type === 'INCOME'){
                income += Number(transaction.amount)
            }
        })
        return income
    },

    expenses(){
        let expense = 0
        Transaction.all.forEach(transaction => {
            if(transaction.type === 'EXPENSE'){
                expense += Number(transaction.amount)
            }
        })
        return expense
    },

    total(){
        let total = Transaction.incomes() - Transaction.expenses()
        return total
    }
}

const DOM = {
    transactionsContainer: document.getElementById('tbody'),

    innerHTMLTransaction(transactions, index) {
        const {description, amount, type, date} = transactions

        const CSSclass = type === "INCOME" ? "positive" : "negative"
        const formatedAmount = Utils.formatCurrency(amount, type)

        const html = `
                <td class="td description">${description}</td>
                <td class="td ${CSSclass}"> ${formatedAmount}</td>
                <td class="td date">${date}</td>
                <td class="td"><button id="${index}"class="btn-td"><img src="./assets/minus.svg" alt="Remover Transação"></button></td>
        `
        return html
    },

    addTransactions(transactions, index) {
        const tr = document.createElement('tr')
        tr.classList.add('tr')
        tr.dataset.index = index
        tr.innerHTML = DOM.innerHTMLTransaction(transactions, index)
        DOM.transactionsContainer.appendChild(tr)
    },

    updateBalance(){
        document.querySelector('.money.input').innerHTML = Utils.formatCurrency(Transaction.incomes(), 'INCOME')
        document.querySelector('.money.output').innerHTML = Utils.formatCurrency(Transaction.expenses(), 'EXPENSES')
        document.querySelector('.money.result').innerHTML = Utils.formatCurrency(Transaction.total(), 'INCOME')
    },

    clearTransactions(){
        DOM.transactionsContainer.innerHTML = ''
    }
}

const Form = {
    description: document.getElementById('input-description'),
    amount: document.getElementById('input-value'),
    date: document.getElementById('input-date'),
    type: document.getElementById('select'),

    getValues() {
        return{
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value,
            type: Form.type.value,
        }
    },

    validateField(){
        const {description, amount, date, type } = Form.getValues()
        if(description.trim() === '' || amount.trim() === '' || date.trim() === '' || type.trim() === ''){
            throw new Error("Por favor preencha todos os campos!")
        }
    },

    formatData(){
        let {description, amount, date, type } = Form.getValues()

        amount = Utils.formatAmount(amount)
        date = Utils.formatDate(date)
        type = Utils.formatType(type)

        return {
            description,
            amount,
            date,
            type
        }
    },

    saveTransaction(transaction){
        Transaction.add(transaction)
    },

    clearFields(){
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
        Form.type.value = ""
    },

    submit(data){
        try{
            Form.validateField()
            const transaction = Form.formatData()
            Form.saveTransaction(transaction)
            Form.clearFields()
            Modal.close()
        }
        catch(error){
            alert(error.message)
        }
    }
}

const App = {
    init() {
    Transaction.all.forEach((transaction, index) => {
        DOM.addTransactions(transaction, index)
    })
    
    const removeBtns = document.querySelectorAll('.btn-td')
    //Remove Transaction
    removeBtns.forEach( (btn, idx) => {
        btn.addEventListener('click', () => {
            Transaction.remove(idx)
        })
    }
    )

    DOM.updateBalance()

    Storage.set(Transaction.all)

    },
    reload() {
        DOM.clearTransactions()
        App.init()
    },
}

App.init()

btnNew.addEventListener('click', () => {
    Modal.open()
})

cancelBtn.addEventListener('click', (evt) => {
    evt.preventDefault()
    Modal.close()
})

//Save Transaction
saveBtn.addEventListener("click", (evt) => {
    evt.preventDefault()
    Form.submit()
})