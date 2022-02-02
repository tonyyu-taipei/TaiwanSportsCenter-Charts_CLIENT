module.exports={
	//我們可以選擇使用production或是development

  devServer:{
    compress: true,
    disableHostCheck: true,
    proxy:'http://home.tonyyu.taipei:1337',
  }
	}