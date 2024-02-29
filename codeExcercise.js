console.log("Hello World");

// console.log('curret date is: ', new Date())
// let trialPeriod = 1;
// const trialEndsDate = new Date();
// trialEndsDate.setDate(trialEndsDate.getDate() + trialPeriod);
// console.log("trialEndsDate is: ", trialEndsDate)

// if(trialEndsDate > new Date()){
//     console.log('Trial Period is still active')
// }else{
//     console.log('Trial Period has expired')
// }

// if(Date > new Date()){
//     console.log('Trial Period is still active')
// }else
// {
//     console.log('Trial Period has expired')
// }

// console.log('curret date is: ', new Date().toDateString())

// const today = new Date()  

// const todayNow = new Date()

// console.log('today is: ', today)
// console.log('todayNow is: ', todayNow)

// // i want to find the date difference between today and todayNow
// const dateDifference = today - todayNow
// console.log('dateDifference is: ', dateDifference)

// console.log('2024-02-29T18:30:00.000Z')

// const date = new Date('2024-02-29T18:30:00.000Z')
// console.log('date is: ', date)

// console.log('date is: ', date.toDateString())

const details = {
    time: '10:30',

}

const currentTime = new Date();
const foodTime = new Date();
const [hours, minutes] = details.time.split(':').map(Number);
foodTime.setHours(hours, minutes);

const timeLeft = foodTime.getTime() - currentTime.getTime();

console.log('hours is: ', hours)
console.log('minutes is: ', minutes)  
console.log('timeLeft is: ', timeLeft)
console.log('currentTime is: ', currentTime)
console.log('foodTime is: ', foodTime)