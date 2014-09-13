package fi.rivermouth.laskutuskone.servlet;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.EntityNotFoundException;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.gson.Gson;

import fi.rivermouth.laskutuskone.Utils;
import fi.rivermouth.laskutuskone.model.Bill;
import fi.rivermouth.laskutuskone.model.FileGroup;

public class FileGroupServlet extends HttpServlet {
	
	private static final long serialVersionUID = 1L;
	private static String kind = "FileGroup";

	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		
		Long id = Utils.parseLong(req.getParameter("id"));
		String name = req.getParameter("name");
		ArrayList<Bill> files = null;
		
		String[] bills = req.getParameterValues("files");
		if (bills != null) {
			files = new ArrayList<Bill>();
			for (String bill : bills) {
				files.add(new Gson().fromJson(bill, Bill.class));
			}
		}
		
		save(id, name, files);

		PrintWriter out = resp.getWriter();
		resp.setContentType("application/json"); 
		out.print("true");
		out.flush();
	}
	
	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		
		Long id = Utils.parseLong(req.getParameter("id"));
		
		String response;
		if (id == null) {
			response = new Gson().toJson(loadList());
		}
		else {
			response = new Gson().toJson(load(id));
		}
		
		PrintWriter out = resp.getWriter();
		resp.setContentType("application/json"); 
		out.print(response);
		out.flush();
	}
	
	public void save(FileGroup fileGroup) {
		Entity entity = new Entity("FileGroup", fileGroup.getId());
		entity.setProperty("id", fileGroup.getId());
		entity.setProperty("name", fileGroup.getName());
		
		getDatastoreService().put(entity);
	}
	
	public void save(Long id, String name, ArrayList<Bill> files) {
		save(new FileGroup(id, name, files));
	}
	
	private FileGroup entityAsFileGroup(Entity entity, boolean loadFiles) {
		ArrayList<Bill> files = null;
		if (loadFiles) {
			files = new BillServlet().loadList(entity.getKey().getId());
		}
		return new FileGroup(entity.getKey().getId(), (String) entity.getProperty("name"), files);
	}
	
	public ArrayList<FileGroup> loadList() {
		ArrayList<FileGroup> entities = new ArrayList<FileGroup>();
		PreparedQuery pq = getDatastoreService().prepare(new Query(kind));
		for (Entity entity : pq.asIterable()) {
			entities.add(entityAsFileGroup(entity, false));
		}
		return entities;
	}
	
	public FileGroup load(long id) {
		try {
			return entityAsFileGroup(getDatastoreService().get(KeyFactory.createKey(kind, id)), true);
		} catch (EntityNotFoundException e) {
			e.printStackTrace();
			return null;
		}
	}
	
	private DatastoreService getDatastoreService() {
		return DatastoreServiceFactory.getDatastoreService();
	}
}
