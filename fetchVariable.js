var lastUpdatedDate = new Date("6/22/2022, 11:47:21 PM");

function setLastUpdated(date){
    lastUpdatedDate = date;
}

async function toUpdate() {
    console.log("hello");
    console.log(lastUpdatedDate);
    return new Promise((resolve, reject) => {
        const date2 = new Date();
    const diffTime = Math.abs(date2 - lastUpdatedDate);
    const diffHour = Math.ceil(diffTime / (1000 )); 

    if(diffHour > 30) {
        lastUpdatedDate = new Date();
        resolve(true);
    } else {
        reject();
    }
    });
    
}

module.exports = {
    toUpdate
}