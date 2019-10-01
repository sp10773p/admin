package co.kr.deleo.admin.base.util;

import org.apache.commons.codec.binary.Base64;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.io.UnsupportedEncodingException;
import java.security.GeneralSecurityException;
import java.security.NoSuchAlgorithmException;
import java.util.UUID;

public class DocUtil {
    private static Logger logger = LoggerFactory.getLogger(DocUtil.class);
    
    /**
     * 16자리의 키값을 입력하여 객체를 생성한다.
     * @param key 암/복호화를 위한 키값
     * @throws UnsupportedEncodingException 키값의 길이가 16이하일 경우 발생
     */
	private static String secretKey = "1234567890123456";
	private static String IV =  secretKey.substring(0,16);

    /**
     * AES256 으로 암호화 한다.
     * @param str 암호화할 문자열
     * @return
     * @throws NoSuchAlgorithmException
     * @throws GeneralSecurityException
     * @throws UnsupportedEncodingException
     */
	public static String encrypt(String str) throws GeneralSecurityException, UnsupportedEncodingException
	{
		if (str==null)	return null;

	    byte[] keyData = secretKey.getBytes();
	    
	    SecretKey secureKey = new SecretKeySpec(keyData, "AES");
	     
	    Cipher c = Cipher.getInstance("AES/CBC/PKCS5Padding");
	    c.init(Cipher.ENCRYPT_MODE, secureKey, new IvParameterSpec(IV.getBytes()));
		
		byte[] encrypted = c.doFinal(str.getBytes("UTF-8"));

		return new String(Base64.encodeBase64(encrypted));
	}
	
    /**
     * AES256으로 암호화된 txt 를 복호화한다.
     * @param str 복호화할 문자열
     * @return
     * @throws NoSuchAlgorithmException
     * @throws GeneralSecurityException
     * @throws UnsupportedEncodingException
     */
    public static String decrypt(String str) throws GeneralSecurityException, UnsupportedEncodingException {
    	
    	if (StringUtils.isEmpty(str)) 	return "";
    	
	    byte[] keyData = secretKey.getBytes();
	    SecretKey secureKey = new SecretKeySpec(keyData, "AES");
	    Cipher c = Cipher.getInstance("AES/CBC/PKCS5Padding");
	    c.init(Cipher.DECRYPT_MODE, secureKey, new IvParameterSpec(IV.getBytes("UTF-8")));

        byte[] byteStr = Base64.decodeBase64(str.getBytes());
        String result = "";
        try{
        	result = new String(c.doFinal(byteStr), "UTF-8");
        }catch (Exception e){
        	logger.error(e.getMessage());
        }
        return result;
    }


	public static String getUUID(){
		return UUID.randomUUID().toString();
		
	}

	public static String getApiKey(){
		String uuid = getUUID();

		//현재시간과 랜덤값으로 UUID생성
		long millis = System.currentTimeMillis();
		java.util.Random r = new java.util.Random(millis);
		long rnd = r.nextLong();
		
		UUID uuid2 = new UUID(rnd, millis);
		String uuid2Str = uuid2.toString();
		
		return uuid + "-" + uuid2Str;
	}
	public static String getSaltStr(){  //이걸 써서 문자열 가지고 올 것 뒤에다 붙일 것
		return getUUID();
	}
	public static String encodeBase64(String str){
		String result;
		result = new String(Base64.encodeBase64(str.getBytes()));
		
		return result;
	}
	public static String decodeBase64(String str){
		String result;
		Base64 base64Encoder = new Base64();
		result = new String(base64Encoder.decode(str.getBytes()));
		
		return result;
	}
	
}
