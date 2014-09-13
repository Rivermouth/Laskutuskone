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
import com.google.appengine.api.datastore.Query.Filter;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query.FilterPredicate;
import com.google.gson.Gson;

import fi.rivermouth.laskutuskone.Utils;
import fi.rivermouth.laskutuskone.model.Bill;

public class BillServlet extends HttpServlet {
	
	private static final long serialVersionUID = 1L;
	private String kind = "Bill";

	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		
		Long groupId = Utils.parseLong(req.getParameter("group_id"));
		
		Long id = Utils.parseLong(req.getParameter("id"));
		String data = req.getParameter("data");
		
		save(id, groupId, data);
	}
	
	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		
		Long groupId = Utils.parseLong(req.getParameter("group_id"));
		
		Long id = Utils.parseLong(req.getParameter("id"));
		
		String response;
		if (id == null) {
			response = new Gson().toJson(loadList(groupId));
		}
		else {
			response = new Gson().toJson(load(id));
		}
		
		PrintWriter out = resp.getWriter();
		resp.setContentType("application/json"); 
		out.print(response);
		out.flush();
	}
	
	public void save(Long id, Long groupId, String data) {
		Entity entity = new Entity(kind, id);
		entity.setProperty("id", id);
		entity.setProperty("group_id", groupId);
		entity.setProperty("data", data);
		
		getDatastoreService().put(entity);
	}
	
	public ArrayList<Bill> loadList(Long groupId) {
		Query query = new Query(kind);
		
		if (groupId != null) {
			Filter groupIdFilter = new FilterPredicate("group_id", FilterOperator.EQUAL, groupId);
			query.setFilter(groupIdFilter);
		}
		
		ArrayList<Bill> entities = new ArrayList<Bill>();
		PreparedQuery pq = getDatastoreService().prepare(query);
		for (Entity entity : pq.asIterable()) {
			entities.add(entityToBill(entity));
		}
		
		return entities;
	}
	
	public Bill load(Long id) {
		try {
			return entityToBill(getDatastoreService().get(KeyFactory.createKey(kind, id)));
		} catch (EntityNotFoundException e) {
			e.printStackTrace();
			return null;
		}
	}
	
	private Bill entityToBill(Entity entity) {
		return new Bill(entity.getKey().getId(), (String) entity.getProperty("name"), (String) entity.getProperty("data"));
	}

	private DatastoreService getDatastoreService() {
		return DatastoreServiceFactory.getDatastoreService();
	}
	
}
