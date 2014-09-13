package fi.rivermouth.laskutuskone;

public class Utils {

	public static Long parseLong(String str) {		
		try {
			return Long.parseLong(str);
		}
		catch (NumberFormatException e) {
			return null;
		}
	}
	
	public static Integer parseInteger(String str) {		
		try {
			return Integer.parseInt(str);
		}
		catch (NumberFormatException e) {
			return null;
		}
	}
	
}
