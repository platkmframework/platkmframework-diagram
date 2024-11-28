export function customPadStart(strValue){
    return strValue.padStart(2, '0');
}

export function dateToStringDDMMYYYYHHMM(strdate){ 
    const formattedDate = new Date(strdate); 
    return customPadStart(formattedDate.getDate() + '')       + "-" +
           customPadStart((formattedDate.getMonth() + 1) +'') + "-" +
           formattedDate.getFullYear()                        +  ":" +
           customPadStart(formattedDate.getHours()   + '')    +  ":" +
           customPadStart(formattedDate.getMinutes() + '');
}

export function dateToStringDDMMYYHHMMSS(strdate){ 
    const formattedDate = new Date(strdate); 
    return customPadStart(formattedDate.getDate() + '')       +  "-" +
           customPadStart((formattedDate.getMonth() + 1) +'') +  "-" +
           formattedDate.getFullYear()                        +  ":" +
           customPadStart(formattedDate.getHours() + '')      +  ":" +
           customPadStart(formattedDate.getMinutes() + '')    +  ":" +
            customPadStart(formattedDate.getSeconds() + '');
}

export function stringDDMMYYY_TODATE(sday){
    const arrayDate = sday.split("-");
    const arrayYearTimes = arrayDate[2].split(":");
    return new Date(arrayYearTimes[0], arrayDate[1]-1, arrayDate[0], arrayYearTimes[1], arrayYearTimes[2], 0);
}

export function dateToStringDDMMYYYY(strdate){
    const formattedDate = new Date(strdate); 
    return customPadStart(formattedDate.getDate() + '')       + "-" +
           customPadStart((formattedDate.getMonth() + 1) +'') + "-" +
           formattedDate.getFullYear() ;
}

export function timeToStringHHMM(strdate){ 
    const formattedDate = new Date(strdate); 
    return customPadStart(formattedDate.getHours() + '') +  ":" +
            customPadStart(formattedDate.getMinutes() + ''); // +  ":"+
}
