package fi.rivermouth.laskutuskone.model;

public class Bill {

	private Long id;
	private String name;
	private String data;
	
	public Bill(Long id, String name, String data) {
		setId(id);
		setName(name);
		setData(data);
	}
	
	public Long getId() {
		return id;
	}
	
	public void setId(Long id) {
		this.id = id;
	}
	
	public String getName() {
		return name;
	}
	
	public void setName(String name) {
		this.name = name;
	}
	
	public String getData() {
		return data;
	}
	
	public void setData(String data) {
		this.data = data;
	}
		
}
