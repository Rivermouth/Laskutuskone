package fi.rivermouth.laskutuskone.model;

import java.util.ArrayList;

public class FileGroup {

	private Long id;
	private String name;
	private ArrayList<Bill> files;
	
	public FileGroup(Long id, String name, ArrayList<Bill> files) {
		setId(id);
		setName(name);
		setFiles(files);
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
	
	public ArrayList<Bill> getFiles() {
		return files;
	}
	
	public void setFiles(ArrayList<Bill> files) {
		this.files = files;
	} 
	
}
