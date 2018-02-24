/*
* 应用程序的启动入口文件
*/

//加载express模块
var express = require('express');

//加载模版处理模块
var swig = require('swig');

//加载body-parser处理post提交过来的数据
var bodyParser = require('body-parser');


//加载数据库模块
var mongoose = require('mongoose');

//加载cookies模块
var Cookies = require('cookies');

//创建app应用 app等同于http.createServer()
var app = express();

var User = require('./models/User');

//设置静态文件托管
app.use('/public', express.static(__dirname + '/public'));

//配置应用模版
//定义当前应用使用的模版引擎
//第一个参数：模版引擎的名称，也是文件的后缀 第二个参数：用于解析处理模版内容的方法
app.engine('html', swig.renderFile);
//设置模版文件存放的目录 第一个参数必须是view,第二个参数是路径
app.set('views', './views');
//注册所使用的模版引擎
app.set('view engine', 'html');
//开发过程中取消模版缓存
swig.setDefaults({cache: false});

app.use(bodyParser.urlencoded({extended: true}));

//设置cookie
/*
app.use(function (req, res, next) {
    req.cookies = new Cookies(req, res);
    next();
});
*/
app.use(function (req, res, next) {

    req.cookies = new Cookies(req, res);

    //解析登陆用户的cookie信息
    req.userInfo = {};

    if (req.cookies.get('userInfo')) {
        try {
            req.userInfo = JSON.parse(req.cookies.get('userInfo'));
            User.findById(req.userInfo._id).then(function (userInfo) {
                req.userInfo.isAdmin = Boolean(userInfo.isAdmin);
                next();
            })

        } catch (e) {
            next();
        }
    }else {
        next();
    }
});


/*
* 根据不同的功能划分模块
*/

app.use('/admin', require('./routers/admin'));
app.use('/api', require('./routers/api'));
app.use('/', require('./routers/main'));


//监听http请求
mongoose.connect('mongodb://localhost:27017/blog', function (err) {
    if (err) {
        console.log('数据库连接失败');
    } else {
        console.log('数据库连接成功');
        app.listen(8888);
    }
});



