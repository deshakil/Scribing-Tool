/* Demo authentication for the review build. Accounts live in this file; the real build replaces this with Supabase Auth. */
(function(global){
  var ACCOUNTS=[
    {email:'dr.sharma@demo.clinic',password:'demo1234',name:'Dr. A. Sharma',role:'General Physician',clinic:'Demo Family Clinic',initials:'AS'},
    {email:'dr.mehta@demo.clinic',password:'demo1234',name:'Dr. P. Mehta',role:'Paediatrician',clinic:'Demo Family Clinic',initials:'PM'}
  ];
  var KEY='clinicscribe.session';
  function read(store){try{var v=store.getItem(KEY);return v?JSON.parse(v):null}catch(e){return null}}
  function write(store,v){try{store.setItem(KEY,JSON.stringify(v))}catch(e){}}
  function clear(store){try{store.removeItem(KEY)}catch(e){}}
  var mem=null;
  global.ClinicAuth={
    login:function(email,password,remember){
      var e=String(email||'').trim().toLowerCase();
      if(!e||!password)return {ok:false,error:'Enter your email and password.'};
      var a=null;for(var i=0;i<ACCOUNTS.length;i++)if(ACCOUNTS[i].email===e)a=ACCOUNTS[i];
      if(!a||a.password!==password)return {ok:false,error:'Email or password is incorrect. Use the demo account below.'};
      var s={email:a.email,name:a.name,role:a.role,clinic:a.clinic,initials:a.initials,at:Date.now()};
      mem=s; write(remember?localStorage:sessionStorage,s); if(!remember)clear(localStorage);
      return {ok:true,session:s};
    },
    current:function(){return mem||read(sessionStorage)||read(localStorage)},
    logout:function(){mem=null;clear(sessionStorage);clear(localStorage)},
    require:function(){var s=this.current();if(!s){location.replace('login.html');return null}return s}
  };
})(window);
