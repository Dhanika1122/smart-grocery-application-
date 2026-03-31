import React, {useEffect,useState} from "react";
import API from "../services/api";

function UserManagement(){

const [users,setUsers] = useState([]);

useEffect(()=>{
fetchUsers();
},[]);

const fetchUsers = async ()=>{

const res = await API.get("/users");

setUsers(res.data);

};

return(

<div className="bg-white p-6 rounded-xl shadow mt-10">

<h2 className="text-xl font-semibold mb-4">
Users
</h2>

<p>Total Users: {users.length}</p>

<table className="w-full mt-4">

<thead>

<tr className="border-b">

<th className="p-2">ID</th>
<th className="p-2">Name</th>
<th className="p-2">Email</th>

</tr>

</thead>

<tbody>

{users.map((u)=>(
<tr key={u.id} className="border-b">

<td className="p-2">{u.id}</td>
<td className="p-2">{u.name}</td>
<td className="p-2">{u.email}</td>

</tr>
))}

</tbody>

</table>

</div>

);

}

export default UserManagement;