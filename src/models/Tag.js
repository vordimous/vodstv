import g from 'genesis-object'
import gDate from './Date'

export default g("Tag", function(){
    var self = {
        id:"",
        createdAt: gDate,
        updatedAt: gDate,
        deletedAt: gDate,
        name:"",
        type:"",
        regex:""
    }
    return self
})