const btnNew = document.querySelector('.btn-new')
const overlay = document.querySelector('.overlay')

const form = document.getElementById('form')
const cancelBtn = document.querySelector('.form-btn.cancel')
const saveBtn = document.querySelector('.form-btn.save')

const toggle = document.getElementById('theme-toggle')

let month = new Date().getMonth()
const months = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"]
const monthDisplay = document.querySelector('.month-display')

const selector = document.querySelector('.months-selector')
const yearSelector = document.querySelector('.year-selector')

const btnPrev = document.querySelector('.prev')    
const btnNext = document.querySelector('.next')
const btnAll = document.querySelector('.all')

//Theme toggle 
toggle.addEventListener('click', (evt) => {
    const html = document.querySelector('html')
    if(evt.target.checked === true){
        html.classList.toggle('dark')
    }
    else{
        html.classList.toggle('dark')
    }
}
)

//Selector receives the current month value
selector.value = month

//Changing the month by selector
selector.addEventListener('change', (evt)=> {
    if(evt.target.value === "undefined"){
        month = undefined
    }
    else{
        month = Number(evt.target.value)
    }
    App.reload()
})
//Changing the year by selector
yearSelector.addEventListener('change', ()=> {
    App.reload()
})


//Changing the month via button
btnPrev.addEventListener('click', () => {
    if(month === undefined){
        month = new Date().getMonth()
    }
    else if( month === 0){
        month = 11
    }
    else{
        month -= 1
    }
    selector.value = month
    App.reload()
})    
btnNext.addEventListener('click', () => {
    if(month === undefined){
        month = new Date().getMonth()
    }
    else if(month === 11){
        month = 0;
    }
    else{
        month += 1
    }
    selector.value = month
 
    App.reload()
})

btnAll.addEventListener('click', () => {
    month = undefined;
    selector.value = month

    App.reload()
})

const inputValue = []

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
        return Math.round(value)
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

        if(month === undefined){
            Transaction.all.forEach(transaction => {
                if(transaction.type === 'INCOME'){
                    income += Number(transaction.amount)
                }
            })
        }
        else{
            Transaction.all.forEach(transaction => {
                let date  = transaction.date.split("/")
                if(Number(date[1]) === month + 1 && transaction.type === 'INCOME'){
                    income += Number(transaction.amount)
                }
            })    
        }        

        return income
    },

    expenses(){
        let expense = 0
        if(month === undefined){
            Transaction.all.forEach(transaction => {
                if(transaction.type === 'EXPENSE'){
                    expense += Number(transaction.amount)
                }
            })
        }
        else{
            Transaction.all.forEach(transaction => {
                let date  = transaction.date.split("/")
                if(Number(date[1]) === month + 1 && transaction.type === 'EXPENSE'){
                    expense += Number(transaction.amount)
                }
            })    
        }        
        
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
                <td class="td ${CSSclass}">${formatedAmount}</td>
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
        const total = document.querySelector('.card.result-card')
        document.querySelector('.money.input').innerHTML = Utils.formatCurrency(Transaction.incomes(), 'INCOME')
        document.querySelector('.money.output').innerHTML = Utils.formatCurrency(Transaction.expenses(), 'EXPENSES')
        Transaction.total() < 0 ? total.classList.add('negative') : total.classList.remove('negative')
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

const Animations = {
    animationClose(){
        let anima = document.querySelector('.animation-div')
        anima.animate([
            {height: `${anima.offsetHeight}px`},
            {height: "0px"}
        ], {
            duration: 400,
        })
    },

    animationOpen(){
        let anima = document.querySelector('.animation-div')
        let selectedYear = yearSelector.value
        
        let array = []
    
        Transaction.all.forEach(transaction => {
            array.push(transaction.date)
        })
    
        let transactionMonths = []
        let transactionMonthAndYear = []
    
        array.forEach(date => {
            const dates = date.split('/')
            transactionMonths.push(dates[1])
            transactionMonthAndYear.push(`${dates[1]}/${dates[2]}`)
        })

        if(month === undefined){
            const length = transactionMonths.length
            anima.animate([
                {height: "0px"},
                {height: `${length * 60}px`}
            ], {
                delay: 400,
                duration: 400,
            })
        }
        else{
            let counter = 0
    
            transactionMonths.forEach(transaction => {
                if(Number(transaction) === month + 1){
                    counter+= 1
                }
                else{
                    // console.log("Other month transactions")
                }
            })

           transactionMonthAndYear.forEach(transaction => {
             array = transaction.split('/')
             thisYear = array[1]
             thisMonth = Number(array[0])
             if (selectedYear === "undefined"){
               //console.log('Do nothing!')
             }
             else if(selectedYear !== thisYear && thisMonth === month + 1){
               counter-= 1
             }
             else{
               //console.log('Something expected hapened')
             }
           })
    
            anima.animate([
                {height: "0px"},
                {height: `${(counter + 1) * 60}px`}
            ], {
                delay: 400,
                duration: 400,
            })
        }
        }
}

const App = {
    init() {
    Transaction.all.forEach((transaction, index) => {
        let date  = transaction.date.split("/")
        let year = yearSelector.value

        if(year === "undefined"){
            if(month === undefined){
                DOM.addTransactions(transaction, index)
            }
            else if(Number(date[1]) === month + 1){         
                DOM.addTransactions(transaction, index)
            }
        }
        else if(date[2] === year){
            if(month === undefined){
                DOM.addTransactions(transaction, index)
            }
            else if(Number(date[1]) === month + 1){         
                DOM.addTransactions(transaction, index)
            }
        }
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
        Animations.animationClose()
        Animations.animationOpen()
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
